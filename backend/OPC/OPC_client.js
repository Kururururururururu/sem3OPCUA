const { OPCUAClient, DataType, AttributeIds, WriteValueOptions, ClientSubscription } = require('node-opcua-client')
const { MonitoringMode } = require('node-opcua-types')
const { TimestampsToReturn } = require('node-opcua-data-value')
let session // OPC session
let client // OPC client
let subscription // OPC subscription
let batchId = 0
let batchIdFromOPC = 0

const PackMLCmdOptions = {
	Reset: 1,
	Start: 2,
	Stop: 3,
	Abort: 4,
	Clear: 5,
}

const PackMLStateOptions = {
	Deactivated: 0,
	Clearing: 1,
	Stopped: 2,
	Starting: 3,
	Idle: 4,
	Suspended: 5,
	Execute: 6,
	Stopping: 7,
	Aborting: 8,
	Aborted: 9,
	Holding: 10,
	Held: 11,
	Resetting: 15,
	Completing: 16,
	Complete: 17,
	Deactivating: 18,
	Activating: 19,
}

const variables = [
	{ name: 'Temperature', path: 'ns=6;s=::Program:Data.Value.Temperature' },
	{
		name: 'StateCurrent',
		path: 'ns=6;s=::Program:Cube.Status.StateCurrent',
	},
	{ name: 'Vibration', path: 'ns=6;s=::Program:Data.Value.Vibration' },
	{ name: 'Barley', path: 'ns=6;s=::Program:Inventory.Barley' },
	{ name: 'Hops', path: 'ns=6;s=::Program:Inventory.Hops' },
	{ name: 'Malt', path: 'ns=6;s=::Program:Inventory.Malt' },
	{ name: 'Wheat', path: 'ns=6;s=::Program:Inventory.Wheat' },
	{ name: 'Yeast', path: 'ns=6;s=::Program:Inventory.Yeast' },
	{ name: 'FillingInventory', path: 'ns=6;s=::Program:FillingInventory' },
	{ name: 'Counter', path: 'ns=6;s=::Program:Maintenance.Counter' },
	{ name: 'State', path: 'ns=6;s=::Program:Maintenance.State' },
	{ name: 'ExecuteState', path: 'ns=6;s=::Program:Cube.Command.CmdChangeRequest' },
	{ name: 'ExecuteOrder', path: 'ns=6;s=::Program:Cube.Command.CntrlCmd' },
	{ name: 'StopReason', path: 'ns=6;s=::Program:Cube.Admin.StopReason.ID' },
	{ name: 'BeerType', path: 'ns=6;s=::Program:Cube.Command.Parameter[1].Value' },
	{ name: 'BeerAmount', path: 'ns=6;s=::Program:Cube.Command.Parameter[2].Value' },
	{ name: 'MachineSpeed', path: 'ns=6;s=::Program:Cube.Command.MachSpeed' },
	{ name: 'SetBatchId', path: 'ns=6;s=::Program:Cube.Command.Parameter[0].Value' },
	{ name: 'BatchId', path: 'ns=6;s=::Program:Cube.Status.Parameter[0].Value' },
]

const products = {
	Pilsner: 0,
	Wheat: 1,
	IPA: 2,
	Stout: 3,
	Ale: 4,
	'Alcohol Free': 5,
}

const speedLimits = {
	[products.Pilsner]: 600,
	[products.Wheat]: 300,
	[products.IPA]: 150,
	[products.Stout]: 200,
	[products.Ale]: 100,
	[products['Alcohol Free']]: 125,
}

function findVariable(name) {
	return variables.find((v) => v.name === name)
}

const opcEndpointUrl = process.env.OPC_URL || 'opc.tcp://192.168.0.122:4840'

module.exports = {
	getBatchId: () => batchIdFromOPC,
	connect: async () => {
		try {
			if (session) {
				console.log('Session already created!')
				return
			}
			client = OPCUAClient.create({
				endpointMustExist: false,
			})
			console.log('Connecting to OPC UA server... !!!', opcEndpointUrl)
			await client.connect(opcEndpointUrl).then(() => console.log('Session created!'))
			session = await client.createSession()
			// make subcribe if there is none
			if (!subscription) {
				module.exports.subscribe('BatchId', (value) => {
					const currentValue = value.value
					console.log('BatchId changed to ', currentValue)
					if (currentValue > 0) {
						batchIdFromOPC = currentValue
					}
				})
			}
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
			}
		}
	},

	/**
	 * @param {"Temperature"|"StateCurrent"|"Vibration"|"Barley"|"Hops"|"Malt"|"Wheat"|"Yeast"|"FillingInventory"|"Counter"|"State"|"StopReason"|"ExecuteState"|"ExecuteOrder"|"BeerType"|"BeerAmount"|"MachineSpeed"|"BatchId"|"SetBatchId"} VariableName - "Temperature
	 * @returns {Promise<Number> | undefined}
	 */
	read: async (VariableName) => {
		const variable = findVariable(VariableName)
		if (variable) {
			const value = await session.readVariableValue(variable.path)
			//console.log(`Read from node ${VariableName} with value ${value.value.value}`)
			return value.value.value
		} else {
			console.error(`Variable ${VariableName} not found`)
		}
	},

	/**
	 * @param {"Temperature"|"StateCurrent"|"Vibration"|"Barley"|"Hops"|"Malt"|"Wheat"|"Yeast"|"FillingInventory"|"Counter"|"State"|"StopReason"|"ExecuteState"|"ExecuteOrder"|"BeerType"|"BeerAmount"|"MachineSpeed"|"BatchId"|"SetBatchId"} VariableName - "Temperature
	 * @param value
	 * @param {number} dataType
	 */
	write: async (VariableName, value, dataType) => {
		if (Object.values(DataType).indexOf(dataType) === -1) {
			throw new Error('Invalid data type')
		}

		const variable = findVariable(VariableName)

		if (!variable) {
			throw new Error(`Variable ${VariableName} not found`)
		}
		const nodeToWrite = {
			nodeId: variable.path,
			attributeId: AttributeIds.Value,
			value: {
				value: {
					dataType: dataType,
					value: value,
				},
			},
		}

		const statusCode = await session.write(nodeToWrite)
		console.log(`Writing to node ${VariableName} with value ${value}`)
		if (statusCode._value !== 0) throw new Error(`Write failed with status code ${statusCode.toString()}`)
		console.log(`Written to node ${VariableName} with status code ${statusCode.toString()}`)
		return statusCode
	},

	maintenence: async () => {
		const StopReason = await module.exports.read('StopReason')
		let Products = []
		if (StopReason === 11) {
			await module.exports.write('ExecuteOrder', 1, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await module.exports.write('ExecuteOrder', 2, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await module.exports.write('ExecuteOrder', 3, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await module.exports.write('ExecuteOrder', 4, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			return true
		} else if (StopReason === 10) {
			await module.exports.write('FillingInventory', true, DataType.Boolean)
			while ((await module.exports.read('FillingInventory')) === true) {
				Products = await Promise.all([
					module.exports.read('Yeast'),
					module.exports.read('Barley'),
					module.exports.read('Wheat'),
					module.exports.read('Malt'),
					module.exports.read('Hops'),
				])
				let Isfull = true
				Products.forEach((element) => {
					if (element < 30000) {
						Isfull = false
					}
				})
				if (Isfull === true) {
					await module.exports.write('FillingInventory', false, DataType.Boolean)
				}
			}
			return true
		}
		console.log('No maintenence needed')
		return false
	},

	/**
	 *
	 * @param {0|1|2|3|4|5} beer_type
	 * @param {number} beer_amount
	 * @param {number} machine_speed
	 * @returns {Promise<boolean>}
	 */
	brew: async (beer_type, beer_amount, machine_speed) => {
		try {
			if (beer_type === undefined || !beer_amount || !machine_speed) {
				console.error('Missing required fields')
				return false
			}

			if (Object.values(products).indexOf(beer_type) === -1) {
				console.error('Invalid beer type')
				return false
			}

			const maxMachineSpeedForBeerType = speedLimits[beer_type]

			if (machine_speed < 0 || machine_speed > maxMachineSpeedForBeerType) {
				console.error(`Invalid machine speed for ${beer_type}. It should be between 0 and ${speedLimits[beer_type]}.`)
				return false
			}

			const nodesToWrite = [
				{
					variable: 'BeerType',
					dataType: DataType.Float,
					value: beer_type,
				},
				{
					variable: 'BeerAmount',
					dataType: DataType.Float,
					value: beer_amount,
				},
				{
					variable: 'MachineSpeed',
					dataType: DataType.Float,
					value: machine_speed,
				},
			]

			let state = await module.exports.read('StateCurrent')
			if (state !== PackMLStateOptions.Execute) {
				console.log('PackMLStateHandler Brew')
				await PackMLStateHandler()
			}

			const currentStopReason = await module.exports.read('StopReason')
			const needsMaintenance = currentStopReason === 10 || currentStopReason === 11

			if (needsMaintenance) await module.exports.maintenence()

			for (let node of nodesToWrite) {
				const StopReason = await module.exports.read('StopReason')
				if (StopReason === 10 || StopReason === 11) {
					await module.exports.maintenence()
				}
				await module.exports.write(node.variable, node.value, node.dataType)
			}

			batchId++
			console.log('Value changed for batchId to ', batchId)
			await module.exports.write('SetBatchId', batchId, DataType.Float)

			console.log(`Brewing ${beer_amount} of beer type ${beer_type} at a speed of ${machine_speed} beers per minute`)
			state = await module.exports.read('StateCurrent')
			if (state !== PackMLStateOptions.Execute) {
				console.log('PackMLStateHandler Brew')
				await PackMLStateHandler()
			}
			return true
		} catch (err) {
			console.error('An error occurred while brewing:', err)
			return false
		}
	},

	disconnect: async () => {
		try {
			await session.close()
			await client.disconnect()
			session = null
			client = null
			console.log('Session closed!')
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
			}
			process.exit(0)
		}
	},
	subscribe: (VariableName, callback) => {
		const variable = findVariable(VariableName)
		if (!variable) {
			throw new Error(`Variable ${VariableName} not found`)
		}

		if (!session) {
			throw new Error('Session not created')
		}

		console.log('Subscribing to node', variable.path)

		subscription = ClientSubscription.create(session, {
			requestedPublishingInterval: 1000,
			requestedMaxKeepAliveCount: 20,
			requestedLifetimeCount: 6000,
			maxNotificationsPerPublish: 1000,
			publishingEnabled: true,
			priority: 10,
		})

		subscription.monitor(
			{
				nodeId: variable.path,
				attributeId: AttributeIds.Value,
			},
			{
				samplingInterval: 100,
				discardOldest: true,
				queueSize: 10,
			},
			TimestampsToReturn.Both,
			MonitoringMode.Reporting
		)

		subscription.on('received_notifications', (notifications) => {
			console.log(
				'Received notifications',
				variable.name,
				variable.path,
				notifications.notificationData[0].monitoredItems[0].value.value
			)
			callback(notifications.notificationData[0].monitoredItems[0].value.value)
		})
	},
}

async function PackMLStateHandler() {
	console.log('PackMLStateHandler')
	const state = await module.exports.read('StateCurrent')
	switch (state) {
		case PackMLStateOptions.Deactivated: {
			break
		}
		case PackMLStateOptions.Clearing: {
			break
		}
		case PackMLStateOptions.Stopped: {
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Reset, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 1000))
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Start, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 3000))
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Reset, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 1000))
			break
		}
		case PackMLStateOptions.Starting: {
			break
		}
		case PackMLStateOptions.Idle: {
			await new Promise((resolve) => setTimeout(resolve, 1000))
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Start, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 3000))
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Reset, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 1000))
			break
		}
		case PackMLStateOptions.Suspended: {
			break
		}
		case PackMLStateOptions.Execute: {
			break
		}
		case PackMLStateOptions.Stopping: {
			break
		}
		case PackMLStateOptions.Aborting: {
			break
		}
		case PackMLStateOptions.Aborted: {
			break
		}
		case PackMLStateOptions.Holding: {
			break
		}
		case PackMLStateOptions.Held: {
			break
		}
		case PackMLStateOptions.Resetting: {
			break
		}
		case PackMLStateOptions.Completing: {
			break
		}
		case PackMLStateOptions.Complete: {
			// reset then clear
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Reset, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 1000))
			await module.exports.write('ExecuteOrder', PackMLCmdOptions.Clear, DataType.Int16)
			await module.exports.write('ExecuteState', true, DataType.Boolean)
			await new Promise((resolve) => setTimeout(resolve, 1000))
			break
		}
		case PackMLStateOptions.Deactivating: {
			break
		}
		case PackMLStateOptions.Activating: {
			break
		}
		default: {
			throw new Error('Invalid state')
		}
	}
}
