const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
	host: process.env.PG_HOST,
	port: process.env.PG_PORT,
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
})

module.exports = {
	write: async (beer_type, amount) => {
		await module.exports.connect()
		await pool.query(`INSERT INTO beers (beer_type, amount, time) VALUES ($1, $2, NOW())`, [beer_type, amount])
		module.exports.disconnect()
	},

	read: async (beer_id) => {
		await module.exports.connect()
		return await pool.query(`SELECT * FROM beers WHERE id=${beer_id}`)
		.then(module.exports.disconnect())
	},

	query: async (query) => {
		await module.exports.connect()
		return await pool.query(query)
		.then(module.exports.disconnect())
	},

	connect: async (options) => {
		try {
			await pool.connect(options)
			console.log('Connected to database')
		} catch (err) {
			console.log(err.message)
			throw err
		}
	},
	disconnect: async () => {
		try {
			await pool.end()
			console.log('Disconnected from database')
		} catch (err) {
			console.log(err.message)
			throw err
		}
	},
}
