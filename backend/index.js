import express from 'express'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 80

app.use(express.static(path.resolve(process.cwd(), '../frontend/dist')))

/*
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders() // flush the headers to establish SSE with client

	const interval = setInterval(async () => {
		const values = [Math.random() * 100, Math.random() * 100]
		const chunk = JSON.stringify({ values })
		res.write(`data: ${chunk}\n\n`)
	}, 1000)

	res.on('close', () => {
		clearInterval(interval)
		res.end()
	})

	send data til clienten med res.write() ?:)
*/

app.listen(PORT, function () {
	console.log(`Server listening on port ${PORT}`)
})
