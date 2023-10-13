import { OPCUAClient } from "node-opcua-client"
async function main() {
    try {
        const endpointUrl2 = "opc.tcp://localhost:48010";
        const client = OPCUAClient.create({
            endpointMustExist: false
        });
        await client.connect(endpointUrl2).then(console.log("Session created!"));;
        const session = await client.createSession();

        const nodeId = "ns=6;s=::Program:Cube.Status.StateCurrent";
        const dataValue = await session.read({ nodeId });

        console.log(`Value: ${dataValue.value.value}`);

        await session.close();
        await client.disconnect();
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
        }
        process.exit(0);
    }
}
main();