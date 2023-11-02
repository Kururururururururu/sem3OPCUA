const { OPCUAClient } = require('node-opcua-client')
const { DataType } = require('node-opcua-client')

let session // OPC session
let client // OPC client

module.exports = {
	connect: async () => {
		try {
			const endpointUrl2 = 'opc.tcp://127.0.0.1:4840'
			client = OPCUAClient.create({
				endpointMustExist: false,
			})
			await client.connect(endpointUrl2).then(() => console.log('Session created!'))
			session = await client.createSession()
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
				throw err
			}
		}
	},

	/**
	 * @param {"Temperature"|"StateCurrent"|"Vibration"|"Barley"|"Hops"|"Malt"|"Wheat"|"Yeast"|"FillingInventory"|"Counter"|"State"} VariableName
	 * @returns {Promise<Number> | undefined}
	 */
	read: async (VariableName) => {
		const variables = [
			{ name: 'Temperature', path: 'ns=6;s=::Program:Data.Value.Temperature' },
			{ name: 'StateCurrent', path: 'ns=6;s=::Program:Cube.Status.StateCurrent' },
			{ name: 'Vibration', path: 'ns=6;s=::Program:Data.Value.Vibration' },
			{ name: 'Barley', path: 'ns=6;s=::Program:Inventory.Barley' },
			{ name: 'Hops', path: 'ns=6;s=::Program:Inventory.Hops' },
			{ name: 'Malt', path: 'ns=6;s=::Program:Inventory.Malt' },
			{ name: 'Wheat', path: 'ns=6;s=::Program:Inventory.Wheat' },
			{ name: 'Yeast', path: 'ns=6;s=::Program:Inventory.Yeast' },
			{ name: 'FillingInventory', path: 'ns=6;s=::Program:FillingInventory' },
			{ name: 'Counter', path: 'ns=6;s=::Program:Maintenance.Counter' },
			{ name: 'State', path: 'ns=6;s=::Program:Maintenance.State' },
		]

		const variable = variables.find((v) => v.name === VariableName)
		if (variable) {
			const value = await session.readVariableValue(variable.path)
			console.log(`${variable.name}: ${value.value.value}`)
			return value.value.value
		} else {
			console.error(`Variable ${VariableName} not found`)
		}
	},

	/**
	 * @param {"Temperature"|"StateCurrent"|"Vibration"|"Barley"|"Hops"|"Malt"|"Wheat"|"Yeast"|"FillingInventory"|"Counter"|"State"} VariableName
	 */
	write: async (VariableName, value, dataType) => {
		const variables = [
			{ name: 'Temperature', path: 'ns=6;s=::Program:Data.Value.Temperature' },
			{ name: 'StateCurrent', path: 'ns=6;s=::Program:Cube.Status.StateCurrent' },
			{ name: 'Vibration', path: 'ns=6;s=::Program:Data.Value.Vibration' },
			{ name: 'Barley', path: 'ns=6;s=::Program:Inventory.Barley' },
			{ name: 'Hops', path: 'ns=6;s=::Program:Inventory.Hops' },
			{ name: 'Malt', path: 'ns=6;s=::Program:Inventory.Malt' },
			{ name: 'Wheat', path: 'ns=6;s=::Program:Inventory.Wheat' },
			{ name: 'Yeast', path: 'ns=6;s=::Program:Inventory.Yeast' },
			{ name: 'FillingInventory', path: 'ns=6;s=::Program:FillingInventory' },
			{ name: 'Counter', path: 'ns=6;s=::Program:Maintenance.Counter' },
			{ name: 'State', path: 'ns=6;s=::Program:Maintenance.State' },
		]
		const variable = variables.find((v) => v.name === VariableName)
		try {
			const nodeToWrite = {
				nodeId: variable.path,
				attributeId: 13,
				value: {
					value: {
						dataType: dataType,
						value: value,
					},
				},
			}

			await session.write(nodeToWrite)
			console.log(`Written to node ${VariableName} with value ${value}`)
		} catch (err) {
			console.error('An error occurred while writing:', err)
		}
	},

	disconnect: async () => {
		try {
			await session.close()
			await client.disconnect()
			console.log('Session closed!')
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
			}
			process.exit(0)
		}
	},
}
