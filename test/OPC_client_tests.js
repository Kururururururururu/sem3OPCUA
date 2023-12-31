const OPCUAClient = require('../backend/OPC/OPC_client')
const chai = require('chai')
const expect = chai.expect
const { DataType } = require('node-opcua-client')

describe('OPC_client', () => {
	it('should be able to connect to the OPC server', async () => {
		await OPCUAClient.connect()
	})

	it('should be able to read a variable from the OPC server', async () => {
		await OPCUAClient.read('Wheat')
	})

	it('should be able to write a variable to the OPC server', async () => {
		await OPCUAClient.write('ExecuteOrder', 1, DataType.Int16)
	})

	it('should brew the beer correctly', async () => {
		const beer_type = 5
		const beer_amount = 100
		const machine_speed = 120

		OPCUAClient.brew(beer_type, beer_amount, machine_speed)
			.then((result) => {
				expect(result).to.be.true
				done()
			})
			.catch((error) => {
				done(error)
			})
	})

	it('should fail when the machine speed is too high', async () => {
		const beer_type = 'Pilsner'
		const beer_amount = 100
		const machine_speed = 700

		const result = await OPCUAClient.brew(beer_type, beer_amount, machine_speed)

		expect(result).to.be.false
	})

	it('should fail when the machine speed is too low', async () => {
		const beer_type = 'Pilsner'
		const beer_amount = 100
		const machine_speed = -1

		const result = await OPCUAClient.brew(beer_type, beer_amount, machine_speed)

		expect(result).to.be.false
	})

	it('Should be able to peform maintenence', async () => {
		await OPCUAClient.maintenence()
	})

	it('should be able to disconnect from the OPC server', async () => {
		await OPCUAClient.disconnect()
	})
})

// use npx mocha test/OPC_client_tests.js to run the tests. Or run npx mocha which runs all the test in the test folder.
