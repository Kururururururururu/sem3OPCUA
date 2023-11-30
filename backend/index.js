const path = require('path')
const express = require('express')
const opcuaClient = require('./OPC/OPC_client')
const database = require('./db.js')
const app = express()
const PORT = process.env.PORT || 3000
const DIST_DIR = process.env.DIST_DIR || '../frontend/dist'

app.use(express.static(path.resolve(process.cwd(), DIST_DIR)))
app.use(express.json())

// make SSE connection to client for the batch id
app.get('/api/batch', async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders() // flush the headers to establish SSE with client

	const opcua = opcuaClient
	await opcua.connect()

	const interval = setInterval(async () => {
		const batch = opcua.getBatchId()
		const chunk = JSON.stringify({ batch })
		res.write(`data: ${chunk}\n\n`)
	}, 1000)

	res.on('close', () => {
		clearInterval(interval)
		res.end()
	})
})

app.get('/api/inventory', async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders() // flush the headers to establish SSE with client

	const opcua = opcuaClient
	await opcua.connect()

	const interval = setInterval(async () => {
		const [wheat, barley, hops, yeast, malt] = await Promise.all([
			opcua.read('Wheat'),
			opcua.read('Barley'),
			opcua.read('Hops'),
			opcua.read('Yeast'),
			opcua.read('Malt'),
		])
		const chunk = JSON.stringify({ wheat, barley, hops, yeast, malt })
		res.write(`data: ${chunk}\n\n`)
	}, 1000)

	res.on('close', () => {
		clearInterval(interval)
		res.end()
	})
})

const beers = [
	{ type: 'Pilsner', id: 0 },
	{ type: 'Wheat', id: 1 },
	{ type: 'IPA', id: 2 },
	{ type: 'Stout', id: 3 },
	{ type: 'Ale', id: 4 },
	{ type: 'Alcohol Free', id: 5 },
]

app.post('/api/pass-to-queue', async (req, res) => {
	try {
		// check if the request has the required fields
		const { amount, type, speed } = req.body
		if (!amount || !type) throw new Error('Request is missing required fields')

		console.log(`Received request to brew ${amount} of ${type}`)

		// receive request to process a beer type and an amount
		const beer = beers.find((v) => v.type === req.body.type) // search map where beer type equals product
		const beer_type = beer.id // get beer type id

		if (beer_type === undefined) throw new Error('Beer type not found')

		// convert amount to number
		const beer_amount = Number(amount)
		if (isNaN(beer_amount)) throw new Error('Amount is not a number')

		console.log(`Received request to brew ${beer_amount} of ${type}`)

		await opcuaClient.connect()

		if (await opcuaClient.brew(beer_type, beer_amount, speed ?? 10)) {
			// send beer type request to queue
			res.status(200) // if ok, return status code OK
			res.send({ status: 'ok' })
		} else {
			res.status(418) // refuse to brew
			res.send({ status: 'error', error: 'Brewing failed' })
		}
	} catch (error) {
		console.error(error)
		res.status(500).send({ error: error.message, status: 'error' })
	}
})

app.listen(PORT, function () {
	console.log(`Server listening on port ${PORT}`)
})
