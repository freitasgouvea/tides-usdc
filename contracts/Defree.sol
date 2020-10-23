//SPDX-License-Identifier: MIT
// Implementation Based on USDC-EIP-3009 Util Example: https://github.com/centrehq/centre-tokens/blob/master/contracts/v2/FiatTokenUtil.sol

pragma solidity 0.6.12;

/**
 * @dev Interface of the ERC20 - EIP standard as defined in the EIP.
 */
interface IERC20_EIP3009 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    //EIP-3009

    // keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)")
    //bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = 0x7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a2267;

    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    //string internal constant _INVALID_SIGNATURE_ERROR = "EIP3009: invalid signature";

    /**
     * @notice Returns the state of an authorization
     * @param authorizer    Authorizer's address
     * @param nonce         Nonce of the authorization
     * @return True if the nonce is used
     */
    function authorizationState(address authorizer, bytes32 nonce)
        external
        view
        returns (bool);

    /**
     * @notice Transfer tokens with a signed authorization
     * @param from          Payer's address (Authorizer)
     * @param to            Payee's address
     * @param value         Amount to be transferred
     * @param validAfter    The time after which this is valid (unix time)
     * @param validBefore   The time before which this is valid (unix time)
     * @param nonce         Unique nonce
     * @param v             v of the signature
     * @param r             r of the signature
     * @param s             s of the signature
     */
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

}

contract Tides {
    
    //address of pool wallet
    address DefreePoolWallet;
    
    //IERC20_EIP3009 public ERC20Interface;
    address public USDCAddress;

    event TransferFailed(address indexed authorizer, bytes32 indexed nonce);

    // (address,address,uint256,uint256,uint256,bytes32) = 20*2 + 32*4 = 168
    uint256 private constant _TRANSFER_PARAM_SIZE = 168;
    // (uint8,bytes32,bytes32) = 1 + 32*2 = 65
    uint256 private constant _SIGNATURE_SIZE = 65;
    // keccak256("transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)")[0:4]
    bytes4 private constant _TRANSFER_WITH_AUTHORIZATION_SELECTOR = 0xe3ee160e;

    event DepositSuccessful(address indexed _from, address indexed _to, uint256 _amount);  
    
    constructor(address _USDCAddress) public {
        USDCAddress = _USDCAddress;
    }

   function transferWithMultipleAuthorizations(
        bytes calldata params,
        bytes calldata signatures,
        bool atomic
    ) external returns (bool) {
        uint256 num = params.length / _TRANSFER_PARAM_SIZE;
        require(num > 0, "DeFree: no transfer provided");
        require(
            num * _TRANSFER_PARAM_SIZE == params.length,
            "DeFree: length of params is invalid"
        );
        require(
            signatures.length / _SIGNATURE_SIZE == num &&
                num * _SIGNATURE_SIZE == signatures.length,
            "DeFree: length of signatures is invalid"
        );

        uint256 numSuccessful = 0;

        for (uint256 i = 0; i < num; i++) {
            uint256 paramsOffset = i * _TRANSFER_PARAM_SIZE;
            uint256 sigOffset = i * _SIGNATURE_SIZE;

            // extract from and to
            bytes memory fromTo = _unpackAddresses(
                abi.encodePacked(params[paramsOffset:paramsOffset + 40])
            );
            // extract value, validAfter, validBefore, and nonce
            bytes memory other4 = abi.encodePacked(
                params[paramsOffset + 40:paramsOffset + _TRANSFER_PARAM_SIZE]
            );
            // extract v
            uint8 v = uint8(signatures[sigOffset]);
            // extract r and s
            bytes memory rs = abi.encodePacked(
                signatures[sigOffset + 1:sigOffset + _SIGNATURE_SIZE]
            );

            // Call transferWithAuthorization with the extracted parameters
            // solhint-disable-next-line avoid-low-level-calls
            (bool success, bytes memory returnData) = USDCAddress.call(
                abi.encodePacked(
                    _TRANSFER_WITH_AUTHORIZATION_SELECTOR,
                    fromTo,
                    other4,
                    abi.encode(v),
                    rs
                )
            );

            // Revert if atomic is true, and the call was not successful
            if (atomic && !success) {
                _revertWithReasonFromReturnData(returnData);
            }

            // Increment the number of successful transfers
            if (success) {
                numSuccessful++;
            } else {
                // extract from
                (address from, ) = abi.decode(fromTo, (address, address));
                // extract nonce
                (, , , bytes32 nonce) = abi.decode(
                    other4,
                    (uint256, uint256, uint256, bytes32)
                );
                emit TransferFailed(from, nonce);
            }
            
            SendGasTips(msg.sender);
            
        }

        // Return true if all transfers were successful
        return numSuccessful == num;
        
    }

    /**
     * @dev Converts encodePacked pair of addresses (20bytes + 20 bytes) to
     * regular ABI-encoded pair of addresses (32bytes + 32bytes)
     * @param packed Packed data (40 bytes)
     * @return Unpacked data (64 bytes)
     */
    function _unpackAddresses(bytes memory packed)
        private
        pure
        returns (bytes memory)
    {
        address addr1;
        address addr2;
        assembly {
            addr1 := mload(add(packed, 20))
            addr2 := mload(add(packed, 40))
        }
        return abi.encode(addr1, addr2);
    }

    /**
     * @dev Revert with reason string extracted from the return data
     * @param returnData    Return data from a call
     */
    function _revertWithReasonFromReturnData(bytes memory returnData)
        private
        pure
    {
        // Return data will be at least 100 bytes if it contains the reason
        // string: Error(string) selector[4] + string offset[32] + string
        // length[32] + string data[32] = 100
        if (returnData.length < 100) {
            revert("DeFree: call failed");
        }

        // If the reason string exists, extract it, and bubble it up
        string memory reason;
        assembly {
            // Skip over the bytes length[32] + Error(string) selector[4] +
            // string offset[32] = 68 (0x44)
            reason := add(returnData, 0x44)
        }

        revert(reason);
    }
    
    /*
     * @dev Send Gas Tips to the Caller of transferWithMultipleAuthorizations
     * CAUTION: under development. This function transfers the balance of this contract to the msg.sender 
     * of the transfer with authorization function. In case of more than one simultaneous call the transfer 
     * of the gas tip may fail.
     * @param msg.sender of transferWithMultipleAuthorizations (address)
     * @return True (boolean)
     */
    function SendGasTips(address caller) internal returns(bool){
       uint256 balance = IERC20_EIP3009(USDCAddress).balanceOf(address(this));
       IERC20_EIP3009(USDCAddress).transfer(caller, balance);
       return true;
    }
    
    receive() payable external {}
    
}
