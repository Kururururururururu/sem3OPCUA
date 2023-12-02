const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const app = require('../backend/index.js')

chai.use(chaiHttp)

describe('Backend API Tests', () => {
	// Test for /api/batch endpoint
	describe('GET /api/batch', () => {
		it('should return a batch id', (done) => {
			chai
				.request(app)
				.get('/api/batch')
				.end((err, res) => {
					expect(res).to.have.status(200)
					expect(res.body).to.have.property('batch')
					done()
				})
		})
	})

	// Test for /api/inventory endpoint
	describe('GET /api/inventory', () => {
		it('should return inventory data', (done) => {
			chai
				.request(app)
				.get('/api/inventory')
				.end((err, res) => {
					expect(res).to.have.status(200)
					expect(res.body).to.have.property('wheat')
					expect(res.body).to.have.property('barley')
					expect(res.body).to.have.property('hops')
					expect(res.body).to.have.property('yeast')
					expect(res.body).to.have.property('malt')
					done()
				})
		})
	})

	// Test for /api/state endpoint
	describe('GET /api/state', () => {
		it('should return the current state', (done) => {
			chai
				.request(app)
				.get('/api/state')
				.end((err, res) => {
					expect(res).to.have.status(200)
					expect(res.body).to.have.property('state')
					done()
				})
		})
	})

	// Test for /api/pass-to-queue endpoint
	describe('POST /api/pass-to-queue', () => {
		it('should process the request and return status ok', (done) => {
			chai
				.request(app)
				.post('/api/pass-to-queue')
				.send({ amount: 10, type: 'Pilsner', speed: 5 })
				.end((err, res) => {
					expect(res).to.have.status(200)
					expect(res.body).to.have.property('status', 'ok')
					done()
				})
		})

		it('should return an error if request is missing required fields', (done) => {
			chai
				.request(app)
				.post('/api/pass-to-queue')
				.send({ amount: 10 })
				.end((err, res) => {
					expect(res).to.have.status(500)
					expect(res.body).to.have.property('status', 'error')
					expect(res.body).to.have.property('error', 'Request is missing required fields')
					done()
				})
		})

		it('should return an error if beer type is not found', (done) => {
			chai
				.request(app)
				.post('/api/pass-to-queue')
				.send({ amount: 10, type: 'InvalidType' })
				.end((err, res) => {
					expect(res).to.have.status(500)
					expect(res.body).to.have.property('status', 'error')
					expect(res.body).to.have.property('error', 'Beer type not found')
					done()
				})
		})

		it('should return an error if amount is not a number', (done) => {
			chai
				.request(app)
				.post('/api/pass-to-queue')
				.send({ amount: 'invalid', type: 'Pilsner' })
				.end((err, res) => {
					expect(res).to.have.status(500)
					expect(res.body).to.have.property('status', 'error')
					expect(res.body).to.have.property('error', 'Amount is not a number')
					done()
				})
		})
	})
})
