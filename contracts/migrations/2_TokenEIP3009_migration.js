const Migrations = artifacts.require("TokenEIP3009");

require('dotenv').config();

console.log(process.env.TOKEN_NAME);

const tokenName = process.env.TOKEN_NAME;
const tokenVersion = process.env.TOKEN_VERSION;
const tokenSymbol = process.env.TOKEN_SYMBOL;
const tokenDecimals = process.env.TOKEN_DECIMALS;
const tokenTotalSupply = process.env.TOKEN_TOTAL_SUPPLY;

module.exports = function (deployer) {
  deployer.deploy(Migrations, tokenName, tokenVersion, tokenSymbol, tokenDecimals, tokenTotalSupply);
};
