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
	write: (beer_type, amount) => {
		module.exports.connect()
		pool.query(`INSERT INTO beers (beer_type, amount, date) VALUES (${beer_type}, ${amount}, NOW())`)
		module.exports.disconnect()
	},

	read: (beer_id) => {
		module.exports.connect()
		return pool.query(`SELECT * FROM beers WHERE id=${beer_id}`)
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
