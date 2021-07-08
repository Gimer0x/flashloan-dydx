// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@studydefi/money-legos/dydx/contracts/DydxFlashloanBase.sol";
import "@studydefi/money-legos/dydx/contracts/ICallee.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Flashloan is ICallee, DydxFlashloanBase {
    IERC20 weth;
    address beneficiay;

    struct MyCustomData {
        address token;
        uint amount;
        uint256 repayAmount;
    }

    event LogFirstSwap(address _sender, address _contract, uint _wethBalance, uint _balOfLoanedToken, uint _repayAmount);

    constructor(
        address _wethAddress,
        address _beneficiary
    ) public payable{
        weth = IERC20(_wethAddress);
        beneficiay = _beneficiary;
    }

    // This is the function that will be called postLoan
    // i.e. Encode the logic to handle your flashloaned funds here
    function callFunction(
        address sender,
        Account.Info memory account,
        bytes memory data
    ) public {
        MyCustomData memory mcd = abi.decode(data, (MyCustomData));
        uint256 balOfLoanedToken = IERC20(mcd.token).balanceOf(address(this));
        
        uint wethBalance = weth.balanceOf(address(this));
        emit LogFirstSwap(sender, address(this), wethBalance, balOfLoanedToken, mcd.repayAmount);

        //Your code goes here, example:
        uint _amount = 1 wei;
        weth.transfer(beneficiay, _amount);

        // Note that you can ignore the line below
        // if your dydx account (this contract in this case)
        // has deposited at least ~2 Wei of assets into the account
        // to balance out the collaterization ratio
        require(
            balOfLoanedToken >= mcd.repayAmount,
            "Not enough funds to repay dydx loan!"
        );

        // TODO: Encode your logic here
        // E.g. arbitrage, liquidate accounts, etc
        //revert("Hello, you haven't encoded your logic");
    }


    //Solo Margin Contract: 0x4EC3570cADaAEE08Ae384779B0f3A45EF85289DE
    function initiateFlashLoan(
        address _solo,
        address _token,
        uint256 _amount)
        external
    {
        ISoloMargin solo = ISoloMargin(_solo);

        // Get marketId from token address
        uint256 marketId = _getMarketIdFromTokenAddress(_solo, _token);

        // Calculate repay amount (_amount + (2 wei))
        // Approve transfer from
        uint256 repayAmount = _getRepaymentAmountInternal(_amount);
        IERC20(_token).approve(_solo, repayAmount);

        // 1. Withdraw $
        // 2. Call callFunction(...)
        // 3. Deposit back $
        Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

        operations[0] = _getWithdrawAction(marketId, _amount);
        operations[1] = _getCallAction(
            // Encode MyCustomData for callFunction
            abi.encode(MyCustomData({token: _token, amount: _amount, repayAmount: repayAmount}))
        );
        operations[2] = _getDepositAction(marketId, repayAmount);

        Account.Info[] memory accountInfos = new Account.Info[](1);
        accountInfos[0] = _getAccountInfo();

        solo.operate(accountInfos, operations);
    }
}