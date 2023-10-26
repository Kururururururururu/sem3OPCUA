const OPCUAClient = require('./OPC_client')


async function main(){
    await OPCUAClient.connect()
    await OPCUAClient.read('temperature')
    await OPCUAClient.disconnect()
}

main()


