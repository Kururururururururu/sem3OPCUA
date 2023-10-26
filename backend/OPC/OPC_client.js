const { OPCUAClient } = require('node-opcua-client')


let session; // OPC session
let client; // OPC client

module.exports = {
	connect: async ()=> { 
		try {
			const endpointUrl2 = 'opc.tcp://localhost:4840'
			client = OPCUAClient.create({
				endpointMustExist: false,
			})
			await client.connect(endpointUrl2).then(() => console.log('Session created!'))
			session = await client.createSession()
			
	
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
			}
		}		
	},

	read: async (nodeIds)=> {
		try {
			const browseResults = await session.browse(nodeIds);
			const nodesToRead = [];
			browseResults.forEach((result) => {
				result.references.forEach((reference) => {
					nodesToRead.push({
						nodeId: reference.nodeId,
						attributeId: opcua.AttributeIds.Value,
					});
				});
			});
			const dataValues = await session.read(nodesToRead);
			return dataValues.map((dataValue) => dataValue.value.value);
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message);
			}
		}
	},
	write: async (nodeId, value)=> {

	},

	disconnect: async ()=> {
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



