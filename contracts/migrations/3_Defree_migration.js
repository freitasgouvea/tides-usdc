const Migrations = artifacts.require("Defree");

require('dotenv').config();

const USDCAddress = process.env.USDC_ADDRESS;

module.exports = function (deployer) {
  deployer.deploy(Migrations, USDCAddress);
};
