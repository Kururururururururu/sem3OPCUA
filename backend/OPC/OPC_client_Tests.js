const OPCUAClient = require('./OPC_client')

OPCUAClient.connect().then(() => {OPCUAClient.disconnect()})


