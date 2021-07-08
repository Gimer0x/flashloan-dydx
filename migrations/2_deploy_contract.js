const Flashloan = artifacts.require("Flashloan");
const { kovan: addresses } = require('../addresses');

module.exports = async function (deployer, network, accounts) {

  //The contract needs some ether!
  const AMOUNT_ETH = .01;
  const AMOUNT_ETH_WEI = web3.utils.toWei(AMOUNT_ETH.toString());

  deployer.deploy(
  Flashloan,
    addresses.tokens.weth,
    accounts[0],
    {from: accounts[0],
    value: AMOUNT_ETH_WEI}
  );
};

