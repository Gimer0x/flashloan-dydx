require('dotenv').config()
const Web3 = require('web3');
const { kovan: addresses } = require('./addresses');
const Flashloan = require('./build/contracts/Flashloan.json');
const Weth = require('./build/contracts/Weth.json');

const web3 = new Web3(
    new Web3.providers.WebsocketProvider(process.env.INFURA_URL)
);

const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const init = async () => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Flashloan.networks[networkId];
        
    const contract = new web3.eth.Contract(
        Flashloan.abi,
        deployedNetwork && deployedNetwork.address
    );

    const weth = new web3.eth.Contract(
        Weth.abi,
        addresses.tokens.weth
    );
    
    const DyDx = addresses.dydx.solo;
    const WETH = addresses.tokens.weth;
        
    const _amount = .01;
    const _amount_wei = web3.utils.toWei(_amount.toString());
    
    try{
        //This example works with the WEth token. Make sure the contract have some of it.
        //Firstly, we send some ether during contract's deployment.
        //Secondly, you should send weth to the contract.
        await weth.methods.transfer(deployedNetwork.address, _amount_wei).send({from:admin, gasLimit:6000000});

        const AMOUNT_WETH = .0001;
        const AMOUNT_WETH_WEI = web3.utils.toWei(AMOUNT_WETH.toString());

        const contractEtherBalance = await web3.eth.getBalance(deployedNetwork.address);
        console.log("Contract's Ether Balance", contractEtherBalance);

        const contractWetherBalance = await weth.methods.balanceOf(deployedNetwork.address).call();
        console.log("Contract's Wether Balance", contractWetherBalance.toString());
        
        const tx = await contract.methods.initiateFlashLoan(
                DyDx,
                WETH,
                AMOUNT_WETH_WEI
                ).send({from:admin,  gasLimit:6000000});

        console.log(tx);
        console.log("Logs: ", tx.events.LogFirstSwap);

        //Examples in Kovan network:
        //Contract: 0x8ac026574328adffe704d6de2c3c406fba09aabe
        //tx hash: 0xf2333cf3092ae9e51f2fad81afd800ff86a495b1130169c7d5f64432e85b31bd

    }catch(err){
        console.log(err);
    }

    process.exit();
}

init();