import { Injectable } from '@angular/core';
import { } from 'eth-sig-util';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);

@Injectable({
  providedIn: 'root',
})
export class MetamaskService {

  account;
  tokenAddress = "0xAf2d007537e5a7eeBad315c26c0B6801fE566494";
  tidesAddress = "0xAf2d007537e5a7eeBad315c26c0B6801fE566494";

  constructor() { }

  connectWallet() {
    window['ethereum'].request({ method: 'eth_requestAccounts' });
  }

  async isConnected() {
    const connected = window['ethereum'].isConnected();
    return connected
  }

  async getAccount() {
    if (window['ethereum'].on) {
      const accounts = await window['ethereum'].request({ method: 'eth_requestAccounts' });
      return accounts[0];
    }
    return "0x00"
  }

  async signGasFeeApprove(userAddress: string, gasFee: number, deadline: number) {
    try {
      const data = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: "USDC RIP3309",
          version: 1,
          chainId: 3,
          verifyingContract: this.tokenAddress,
        },
        primaryType: "TransferWithAuthorization",
        message: {
          from: userAddress,
          to: this.tidesAddress,
          value: gasFee.toString(10),
          validAfter: 0,
          validBefore: Math.floor(Date.now() / 1000) + 3600 * deadline,
          nonce: Web3.utils.randomHex(32),
        },
      };

      const signaturePrincipal = await window['ethereum']
        .request({
          method: "eth_signTypedData_v4",
          params: [userAddress, JSON.stringify(data)],
        })
        /*
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.log(error)
        });
        */
        ;

      const v = "0x" + signaturePrincipal.slice(130, 132);
      const r = signaturePrincipal.slice(0, 66);
      const s = "0x" + signaturePrincipal.slice(66, 130);

      var approvesFees = JSON.parse(localStorage.getItem('approvesFees') || '[]');

      var id = 0;

      if (localStorage.getItem('approvesFees') == null) {
        id = 1;
      } else {
        id = localStorage.getItem('approvesFees').length + 1;
      }

      approvesFees.push({
        id: id,
        addressFrom: userAddress,
        addressTo: this.tidesAddress,
        valueApprove: gasFee.toString(10),
        deadline: data.message.validBefore,
        gasFee: 0,
        nonce: data.message.nonce,
        v: v,
        r: r,
        s: s,
        status: true,
        type: 'gasFeeTx',
      });

      localStorage.setItem("approvesFees", JSON.stringify(approvesFees));

      console.log('BETA VERSION: Sign Saved on Local Storage.');

      return true;

    } catch (e) {
      console.log(e);
    }
  }

  async signTxApprove(userAddress: string, recipientAddress: string, amountBN: number, gasFee: number, deadline: number) {
    try {
      const data = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: "USDC RIP3309",
          version: 1,
          chainId: 3,
          verifyingContract: this.tokenAddress,
        },
        primaryType: "TransferWithAuthorization",
        message: {
          from: userAddress,
          to: recipientAddress,
          value: amountBN.toString(10),
          validAfter: 0,
          validBefore: Math.floor(Date.now() / 1000) + 3600 * deadline,
          nonce: Web3.utils.randomHex(32),
        },
      };

      const signaturePrincipal = await window['ethereum']
        .request({
          method: "eth_signTypedData_v4",
          params: [userAddress, JSON.stringify(data)],
        })
        /*
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.log(error)
        });
        */
        ;

      const v = "0x" + signaturePrincipal.slice(130, 132);
      const r = signaturePrincipal.slice(0, 66);
      const s = "0x" + signaturePrincipal.slice(66, 130);

      var approvesTxs = JSON.parse(localStorage.getItem('approvesTxs') || '[]');

      var id = 0;

      if (localStorage.getItem('approvesTxs') == null) {
        id = 1;
      } else {
        id = localStorage.getItem('approvesTxs').length + 1;
      }

      approvesTxs.push({
        id: id,
        addressFrom: userAddress,
        addressTo: recipientAddress,
        valueApprove: amountBN.toString(10),
        gasFee: gasFee,
        deadline: data.message.validBefore,
        nonce: data.message.nonce,
        v: v,
        r: r,
        s: s,
        status: true,
        type: 'mainTx',
      });

      localStorage.setItem("approvesTxs", JSON.stringify(approvesTxs));

      console.log('BETA VERSION: Approve Saved on Local Storage.');

      return true;

    } catch (e) {
      console.log(e);
    }
  }

}
