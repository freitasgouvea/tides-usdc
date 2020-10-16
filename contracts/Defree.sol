pragma solidity 0.6.12;

import "./ownership//ownable.sol";  
import "./lifecycle/pausable.sol";  
import { IERC20_EIP3009 } from "./interfaces/IERC20_EIP3009.sol";

contract Defree is Ownable, Pausable {
    
    //address of pool wallet
    address DefreePoolWallet;
    
    IERC20_EIP3009 public ERC20Interface;
    address public USDCAddress;

    bytes4 private constant _TRANSFER_WITH_AUTHORIZATION_SELECTOR = 0xe3ee160e;

    event DepositSuccessful(address indexed _from, address indexed _to, uint256 _amount);  
    
    constructor(address _aaveLendingPoolUSDCAddress, address _USDCAddress) public {
        DefreePoolWallet = msg.sender;
        USDCAddress = _USDCAddress;
        ERC20Interface = IERC20_EIP3009(USDCAddress);
    }

    function authorizationState(){

    }

    function depositWithAutorization(){
        
    }

    /*

    function saveApproval(address _owner) external public view returns (address, uint256, uint256, uint256) {
        OpenApproval memory OA = approvalMap[_owner];
        return (OA.owner, OA.amount, OA.gasTx, OA.deadline);
    }

    function getApproval(address _owner) external public view returns (address, uint256, uint256, uint256) {
        OpenApproval memory OA = approvalMap[_owner];
        return (OA.owner, OA.amount, OA.gasTx, OA.deadline);
    }

    */
    
    function transfer() public onlyOwner whenNotPaused  {
        for (uint i=0; i<approvalIndex.length; i++) {
            OpenApproval storage approvalTransfer = approvalIndex[i];
            require(block.timestamp < approvalTransfer.deadline);//delete
            ERC20Interface.transferFrom(approvalTransfer.owner,DefreePoolWallet, approvalTransfer.gasTx);
            //aaveLendingPoolInterface.Transfer(USDCAddress, approvalTransfer.amount, 0);
            delete approvalIndex[i];
            emit TransferSuccessful(approvalTransfer.owner, aaveLendingPoolUSDCAddress, approvalTransfer.amount);
        }
    }
    
    receive() payable external {}
    
}