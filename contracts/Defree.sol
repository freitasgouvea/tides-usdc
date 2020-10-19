// SPDX-License-Identifier: MIT
// Implementation Based on: https://github.com/centrehq/centre-tokens/tree/master/contracts/v2

pragma solidity 0.6.12;

//import "./ownership//ownable.sol";  
//import "./lifecycle/pausable.sol";  
import { IERC20_EIP3009 } from "./interfaces/IERC20_EIP3009.sol";

contract Defree {
    
    //address of pool wallet
    address DefreePoolWallet;
    
    //IERC20_EIP3009 public ERC20Interface;
    address public USDCAddress;

    // (address,address,uint256,uint256,uint256,bytes32) = 20*2 + 32*4 = 168
    uint256 private constant _TRANSFER_PARAM_SIZE = 168;
    // (uint8,bytes32,bytes32) = 1 + 32*2 = 65
    uint256 private constant _SIGNATURE_SIZE = 65;
    // keccak256("transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)")[0:4]
    bytes4 private constant _TRANSFER_WITH_AUTHORIZATION_SELECTOR = 0xe3ee160e;

    event TransferFailed(address indexed authorizer, bytes32 indexed nonce);

    event DepositSuccessful(address indexed _from, address indexed _to, uint256 _amount);  
    
    constructor(address _USDCAddress) public {
        USDCAddress = _USDCAddress;
        //ERC20Interface = IERC20_EIP3009(USDCAddress);
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
    
    receive() payable external {}
}