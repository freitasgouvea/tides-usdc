pragma solidity 0.6.12;

import "./ownership//ownable.sol";  
import "./lifecycle/pausable.sol";  
//import "./utils/safemath.sol";
//import "./utils/address.sol";
import "./utils/TransferHelp.sol";
import "./aave/ILendingPool.sol";
import "./aave/ILendingPoolAddressesProvider.sol";

import { IERC20 } from "./interfaces/IERC20.sol";

contract DefreeUSDCAAVE is Ownable, Pausable {
    
    //address of pool wallet
    address DefreePoolWallet;

    //book of orders
    struct OpenApproval{
        address owner;
        uint256 amount;
        uint256 gasTx;
        uint256 deadline;
    }
    
    //book of deposits
    struct AaveDeposit{
        address owner;
        uint256 amount;
    }
    
    mapping(address => OpenApproval) public approvalMap;  
    mapping(address => AaveDeposit) public depositMap;
    OpenApproval[] public approvalIndex;
    AaveDeposit[] public depositsIndex;
    
    IERC20 public ERC20Interface;
    ILendingPool public aaveLendingPoolInterface;
    
    //AAVE and USDC
    address public aaveLendingPoolUSDCAddress;
    address public USDCAddress;

    event ApprovalSuccessful(address indexed _from, address indexed _to, uint256 _amount, uint256 gasTx, uint256 deadline);      
    event DepositSuccessful(address indexed _from, address indexed _to, uint256 _amount);  
    
    constructor(address _aaveLendingPoolUSDCAddress, address _USDCAddress) public {
        DefreePoolWallet = msg.sender;
        USDCAddress = _USDCAddress;
        ERC20Interface = IERC20(USDCAddress);
        aaveLendingPoolUSDCAddress = _aaveLendingPoolUSDCAddress;
        aaveLendingPoolInterface = ILendingPool(aaveLendingPoolUSDCAddress);
    }
    
    function registryApprove(uint256 _amount, uint256 _gasTx, uint256 _deadline) public whenNotPaused {
        ERC20Interface.approve(aaveLendingPoolUSDCAddress, _gasTx);
        ERC20Interface.approve(DefreePoolWallet, _amount);
        OpenApproval memory OA = OpenApproval(msg.sender, _amount, _gasTx, _deadline);
        approvalMap[msg.sender] = OA;
        emit ApprovalSuccessful(msg.sender, aaveLendingPoolUSDCAddress, _amount, _gasTx, _deadline);
    }
    
    function depositAave() public onlyOwner whenNotPaused  {
        for (uint i=0; i<approvalIndex.length; i++) {
            OpenApproval storage approvalDeposit = approvalIndex[i];
            require(block.timestamp < approvalDeposit.deadline);//delete
            ERC20Interface.transferFrom(approvalDeposit.owner,DefreePoolWallet, approvalDeposit.gasTx);
            //aaveLendingPoolInterface.deposit(USDCAddress, approvalDeposit.amount, 0);
            delete approvalIndex[i];
            emit DepositSuccessful(approvalDeposit.owner, aaveLendingPoolUSDCAddress, approvalDeposit.amount);
        }
    }
    
    function getApproval(address _owner) public view returns (address, uint256, uint256, uint256) {
        OpenApproval memory OA = approvalMap[_owner];
        return (OA.owner, OA.amount, OA.gasTx, OA.deadline);
    }
    
    receive() payable external {}
    
}