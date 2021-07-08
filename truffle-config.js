const path = require("path");
require('dotenv').config({path: './.env'});
const HDWalletProvider = require("@truffle/hdwallet-provider");
//`https://kovan.infura.io/v3/${process.env.PROJECT_ID}`
//`wss://kovan.infura.io/ws/v3/${process.env.PROJECT_ID}`
module.exports = {

  networks: {
    kovan: {
      provider: () => 
          new HDWalletProvider(
            process.env.PRIVATE_KEY,
            `wss://kovan.infura.io/ws/v3/${process.env.PROJECT_ID}`
          ),
          network_id: 42,
          gas: 6721975,
          gasPrice: 10000000000,
          websockets: true,
          networkCheckTimeout: 10000000,
          //confirmations: 2,
          timeoutBlocks: 200,
          skipDryRun: true
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      //version: "0..0",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
  //
  // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
  // those previously migrated contracts available in the .db directory, you will need to run the following:
  // $ truffle migrate --reset --compile-all

  db: {
    enabled: false
  }
};
