const OPCUAClient = require("../backend/OPC/OPC_client");
const chai = require("chai");
const expect = chai.expect;

describe("OPC_client", () => {
  it("should be able to connect to the OPC server", async () => {
    await OPCUAClient.connect();
    
  });

  it("should be able to read a variable from the OPC server", async () => {
    await OPCUAClient.read("Yeast");
  });

  it("should be able to write a variable to the OPC server", async () => {
    await OPCUAClient.write("Yeast", "1000", "Float");
  });

  it("should be able to disconnect from the OPC server", async () => {
    await OPCUAClient.disconnect();

  });
});

// use npx mocha test/OPC_client_tests.js to run the tests.