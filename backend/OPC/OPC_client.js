const {OPCUAClient, DataType, AttributeIds, WriteValueOptions} = require('node-opcua-client')

let session // OPC session
let client // OPC client

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

module.exports = {
    connect: async () => {
        try {
            if (client && session) {
                await session.close()
                await client.disconnect()
            }
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
     * @param {"Temperature"|"StateCurrent"|"Vibration"|"Barley"|"Hops"|"Malt"|"Wheat"|"Yeast"|"FillingInventory"|"Counter"|"State"|"StopReason"|"ExecuteState"|"ExecuteOrder"} VariableName
     * @returns {Promise<Number> | undefined}
     */
    read: async (VariableName) => {
        const variables = [
            {name: 'Temperature', path: 'ns=6;s=::Program:Data.Value.Temperature'},
            {
                name: 'StateCurrent',
                path: 'ns=6;s=::Program:Cube.Status.StateCurrent',
            },
            {name: 'Vibration', path: 'ns=6;s=::Program:Data.Value.Vibration'},
            {name: 'Barley', path: 'ns=6;s=::Program:Inventory.Barley'},
            {name: 'Hops', path: 'ns=6;s=::Program:Inventory.Hops'},
            {name: 'Malt', path: 'ns=6;s=::Program:Inventory.Malt'},
            {name: 'Wheat', path: 'ns=6;s=::Program:Inventory.Wheat'},
            {name: 'Yeast', path: 'ns=6;s=::Program:Inventory.Yeast'},
            {name: 'FillingInventory', path: 'ns=6;s=::Program:FillingInventory'},
            {name: 'Counter', path: 'ns=6;s=::Program:Maintenance.Counter'},
            {name: 'State', path: 'ns=6;s=::Program:Maintenance.State'},
            {name: 'StopReason', path: 'ns=6;s=::Program:Cube.Admin.StopReason.ID'},
            {name: 'ExecuteState', path: 'ns=6;s=::Program:Cube.Command.CmdChangeRequest'},
            {name: 'ExecuteOrder', path: 'ns=6;s=::Program:Cube.Command.CntrlCmd'},
        ]

        const variable = variables.find((v) => v.name === VariableName)
        if (variable) {
            const value = await session.readVariableValue(variable.path)
            console.log(`Read from node ${VariableName} with value ${value.value.value}`)
            return value.value.value
        } else {
            console.error(`Variable ${VariableName} not found`)
        }
    },

    /**
     * @param {"Temperature"|"StateCurrent"|"Vibration"|"Barley"|"Hops"|"Malt"|"Wheat"|"Yeast"|"FillingInventory"|"Counter"|"State"|"ExecuteState"|"ExecuteOrder"|"StopReason"} VariableName
     * @param value
     * @param {number} dataType
     */
    write: async (VariableName, value, dataType) => {
        if (Object.values(DataType).indexOf(dataType) === -1) {
            console.error('Invalid data type')
            return false
        }

        const variables = [
            {name: 'Temperature', path: 'ns=6;s=::Program:Data.Value.Temperature'},
            {
                name: 'StateCurrent',
                path: 'ns=6;s=::Program:Cube.Status.StateCurrent',
            },
            {name: 'Vibration', path: 'ns=6;s=::Program:Data.Value.Vibration'},
            {name: 'Barley', path: 'ns=6;s=::Program:Inventory.Barley'},
            {name: 'Hops', path: 'ns=6;s=::Program:Inventory.Hops'},
            {name: 'Malt', path: 'ns=6;s=::Program:Inventory.Malt'},
            {name: 'Wheat', path: 'ns=6;s=::Program:Inventory.Wheat'},
            {name: 'Yeast', path: 'ns=6;s=::Program:Inventory.Yeast'},
            {name: 'FillingInventory', path: 'ns=6;s=::Program:FillingInventory'},
            {name: 'Counter', path: 'ns=6;s=::Program:Maintenance.Counter'},
            {name: 'State', path: 'ns=6;s=::Program:Maintenance.State'},
            {name: 'ExecuteState', path: 'ns=6;s=::Program:Cube.Command.CmdChangeRequest'},
            {name: 'ExecuteOrder', path: 'ns=6;s=::Program:Cube.Command.CntrlCmd'},
            {name: 'StopReason', path: 'ns=6;s=::Program:Cube.Admin.StopReason.ID'},
        ]

        const variable = variables.find((v) => v.name === VariableName)
        try {
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
            console.log(`Written to node ${VariableName} with value ${value}`)
            if (statusCode._value !== 0) throw new Error(`Write failed with status code ${statusCode.toString()}`)
            console.log(`Written to node ${VariableName} with status code ${statusCode.toString()}`)
            return true
        } catch (err) {
            console.error('An error occurred while writing:', err)
            return false
        }
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

            const speedLimits = {
                Pilsner: 600,
                Wheat: 300,
                IPA: 150,
                Stout: 200,
                Ale: 100,
                'Alcohol Free': 125,
            }

            if (machine_speed < 0 || machine_speed > speedLimits[beer_type]) {
                console.error(`Invalid machine speed for ${beer_type}. It should be between 0 and ${speedLimits[beer_type]}.`)
                return false
            }

            const nodesToWrite = [
                {
                    nodeId: 'ns=6;s=::Program:Cube.Command.Parameter[1].Value',
                    attributeId: AttributeIds.Value,
                    value: {
                        value: {
                            dataType: DataType.Float,
                            value: beer_type,
                        },
                    },
                },
                {
                    nodeId: 'ns=6;s=::Program:Cube.Command.Parameter[2].Value',
                    attributeId: AttributeIds.Value,
                    value: {
                        value: {
                            dataType: DataType.Float,
                            value: beer_amount,
                        },
                    },
                },
                {
                    nodeId: 'ns=6;s=::Program:Cube.Command.MachSpeed',
                    attributeId: AttributeIds.Value,
                    value: {
                        value: {
                            dataType: DataType.Float,
                            value: machine_speed,
                        },
                    },
                },
            ]

            const currentStopReason = await module.exports.read('StopReason')
            const needsMaintenance = currentStopReason === 10 || currentStopReason === 11

            if (needsMaintenance) await module.exports.maintenence()

            for (let node of nodesToWrite) {
                const StopReason = await module.exports.read('StopReason')
                if (StopReason === 10 || StopReason === 11) {
                    await module.exports.maintenence()
                }
                const statusCode = await session.write(node)
                if (statusCode._value !== 0) throw new Error(`Write failed with status code ${statusCode.toString()}`)
                console.log(`Written to node ${node.nodeId} with status code ${statusCode.toString()}`)
            }

            console.log(`Brewing ${beer_amount} of beer type ${beer_type} at a speed of ${machine_speed} beers per minute`)
            const state = await module.exports.read('StateCurrent')
            console.log(`Current state: ${state}`)
            if (state !== PackMLStateOptions.Execute) {
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
