pragma solidity ^0.6.12;

interface ILendingPoolAddressesProvider {
    function getLendingPoolCore() external view returns (address payable);
    function getLendingPool() external view returns (address);
}