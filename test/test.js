const OPCUAClient = require("../backend/OPC/OPC_client");
const chai = require("chai");
const expect = chai.expect;

describe("OPC_client", () => {
  it("should be able to connect to the OPC server", async () => {
    await OPCUAClient.connect();
    expect(OPCUAClient.client).to.not.be.undefined;
    expect(OPCUAClient.session).to.not.be.undefined;
  });

  it("should be able to disconnect from the OPC server", async () => {
    await OPCUAClient.disconnect();
    expect(OPCUAClient.client).to.be.undefined;
    expect(OPCUAClient.session).to.be.undefined;
  });
});

// use npx mocha test/test.js to run the tests.