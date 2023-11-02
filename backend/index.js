const path = require('path')
const express = require('express')
const opcuaClient = require('./OPC/OPC_client')
const app = express()
const PORT = process.env.PORT || 80

app.use(express.static(path.resolve(process.cwd(), '../frontend/dist')))

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
		const values = { wheat, barley, hops, yeast, malt,stateCurrent}
		const chunk = JSON.stringify({ values })
		res.write(`data: ${chunk}\n\n`)
	}, 1000)

	res.on('close', () => {
		clearInterval(interval)
		res.end()
	})
})

app.listen(PORT, function () {
	console.log(`Server listening on port ${PORT}`)
})
