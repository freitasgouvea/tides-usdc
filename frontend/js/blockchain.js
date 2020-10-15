let contractAddress = "0xAbaC6e1dDcE1c2B4dafBD6E6a1Adb3096Fe2Cb61";

let providerRead = new ethers.providers.InfuraProvider('rinkeby', 'd7af4ca348a2460aadd341988fee82fd');
let contractRead = new ethers.Contract(contractAddress, contractAbi, providerRead);

let providerSign = new ethers.providers.Web3Provider(web3.currentProvider);
let signer = providerSign.getSigner();

let contractSign = new ethers.Contract(contractAddress, contractAbi, signer);

console.log(providerSign, signer, contractSign);

async function load() {
    let ethereum = window.ethereum;
    await ethereum.enable();
}

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
        name: tokenName,
        version: tokenVersion,
        chainId: selectedChainId,
        verifyingContract: tokenAddress,
    },
    primaryType: "TransferWithAuthorization",
    message: {
        from: userAddress,
        to: recipientAddress,
        value: amountBN.toString(10),
        validAfter: 0,
        validBefore: Math.floor(Date.now() / 1000) + 3600, // Valid for an hour
        nonce: Web3.utils.randomHex(32),
    },
};

const signature = await ethereum.request({
    method: "eth_signTypedData_v4",
    params: [userAddress, JSON.stringify(data)],
});

const v = "0x" + signature.slice(130, 132);
const r = signature.slice(0, 66);
const s = "0x" + signature.slice(66, 130);

async function submitApproval() {
    let _payerID = "Anonimo"
    let overrides = {
        value: valueBoleto,
        gasPrice: utils.parseUnits('9.0', 'gwei'),
        gasLimit: 10000000
    };
    try {
        if (contractSign) {
            let payment = await contractSign.pagarBoleto(codeBoleto, _payerID, overrides).then((result) => {
                console.log(result);
            });
            alert("Boleto processado na transação nº: " + payment.hash)
        }
    } catch (err) {
        console.error('obtemBoletoHash', err)
        alert("Não foi possível realizar o pagamento, tente novamente.")
    }
}