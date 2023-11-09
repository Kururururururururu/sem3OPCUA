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

  it('should brew the beer correctly', async () =>{
    const beer_type = 'Pilser';
    const beer_amount = 100;
    const machine_speed = 500;

    const result = await OPCUAClient.brew(beer_type, beer_amount, machine_speed);

    expect(result).to.be.true;
  });

  
  it('should fail when the machine speed is too high', async () =>{
    const beer_type = 'Pilser';
    const beer_amount = 100;
    const machine_speed = 700;

    const result = await OPCUAClient.brew(beer_type, beer_amount, machine_speed);

    expect(result).to.be.false;
  });

  it('should fail when the machine speed is too low', async () =>{
    const beer_type = 'Pilser';
    const beer_amount = 100;
    const machine_speed = -1;

    const result = await OPCUAClient.brew(beer_type, beer_amount, machine_speed);

    expect(result).to.be.false;
  });

  it("should be able to disconnect from the OPC server", async () => {
    await OPCUAClient.disconnect();

  });
});

// use npx mocha test/OPC_client_tests.js to run the tests.