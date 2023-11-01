const OPCUAClient = require('./OPC_client')


async function main(){
    await OPCUAClient.connect()
    await OPCUAClient.read('Yeast')
    await OPCUAClient.write('Yeast', '1000', 'Float')
    await OPCUAClient.disconnect()
}

main()


