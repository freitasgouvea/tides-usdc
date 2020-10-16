let contractAddress = "0xAf2d007537e5a7eeBad315c26c0B6801fE566494";
let providerRead = new ethers.providers.InfuraProvider('ropsten', 'd7af4ca348a2460aadd341988fee82fd');
let contractRead = new ethers.Contract(contractAddress, contractABI, providerRead);

async function load() {
    let ethereum = window.ethereum;
    await ethereum.enable();
}

async function submitApproval() {
    try {

        let x = document.getElementById("approveForm");
        let name = await contractRead.name();
        let version = 1;
        let chainId = 42;
        let verifyingContract = contractAddress;

        let data = {
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
                name,
                version,
                chainId,
                verifyingContract,
            },
            primaryType: "TransferWithAuthorization",
            message: {
                from: ethers.signer.getAddress(),
                to: x.value.recipientAddress,
                value: x.value.valueApprove.toString(10),
                validAfter: 0,
                validBefore: Math.floor(Date.now() / 1000) + 3600 * x.value.deadline, // Valid for an hour
                nonce: ethers.utils.randomHex(32),
            },
        };

        console.log(data)

        const signature = await ethereum.request({
            method: "eth_signTypedData_v4",
            params: [userAddress, JSON.stringify(data)],
        });

        console.log(signature)

        const v = "0x" + signature.slice(130, 132);
        const r = signature.slice(0, 66);
        const s = "0x" + signature.slice(66, 130);

        var localStorage = 'approves';

        function addToLocalStorageArray() {
            var existing = localStorage.getItem(localStorage);
            existing = existing ? existing.split(',') : [];
            existing.push(JSON.stringify(data));
            localStorage.setItem(localStorage, existing.toString());
        };
    }
    catch (err) {
        console.error('approve error', err)
        alert("Try Again.")
    }
}