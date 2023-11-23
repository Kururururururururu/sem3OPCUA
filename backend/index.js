const path = require('path')
const express = require('express')
const opcuaClient = require('./OPC/OPC_client')
const database = require('./db.js')
const app = express()
const PORT = process.env.PORT || 80

app.use(express.static(path.resolve(process.cwd(), '../frontend/dist')))
app.use(express.json())

app.get('/api', async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders() // flush the headers to establish SSE with client

	const opcua = opcuaClient
	await opcua.connect()

	const interval = setInterval(async () => {
		const wheat = await opcua.read('Wheat')
		const barley = await opcua.read('Barley')
		const hops = await opcua.read('Hops')
		const stateCurrent = await opcua.read('StateCurrent')
		const yeast = await opcua.read('Yeast')
		const malt = await opcua.read('Malt')
		const values = { wheat, barley, hops, yeast, malt, stateCurrent }
		const chunk = JSON.stringify({ values })
		res.write(`data: ${chunk}\n\n`)
	}, 1000)

	res.on('close', () => {
		clearInterval(interval)
		res.end()
	})
})

app.post('/pass-to-queue', async (req, res) => {
	/*
    const products = [
        { type: 'Pilser', id: 0 },
        { type: 'Wheat', id: 1 },
        { type: 'IPA', id: 2 },
        { type: 'Stout', id: 3 },
        { type: 'Ale', id: 4 },
        { type: 'Alcohol Free', id: 5 }
    ]
    // receive request to process a beer type and an amount
    beer_type = products.find(v => v.type === req.body.type).id	// search map where beer type equals product
    */

	try {
		console.log(req.body)
		// check if the request has the required fields
		const { amount, type } = req.body
		if (!amount || !type) throw new Error('Request is missing required fields')

		const beer_type = type
		// convert amount to number
		const beer_amount = Number(amount)
		if (isNaN(beer_amount)) throw new Error('Amount is not a number')

		console.log(`Received request to brew ${beer_amount} of ${beer_type}`)

		await opcuaClient.connect()

		if (await opcuaClient.brew(beer_type, beer_amount, 50)) {
			// send beer type request to queue
			res.status(200) // if ok, return status code OK
		} else {
			res.status(418) // refuse to brew
		}

		res.send({ status: 'ok' })
	} catch (error) {
		console.error(error)
		res.status(500).send({ error: error.message, status: 'error' })
	}
})

app.listen(PORT, function () {
	console.log(`Server listening on port ${PORT}`)
})
