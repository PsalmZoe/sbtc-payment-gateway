const {
  makeRandomPrivKey,
  getAddressFromPrivateKey,
} = require('@stacks/transactions');

// Generate private key
const privKeyObj = makeRandomPrivKey();
const privKeyHex = privKeyObj.toString('hex');

console.log("Private key:", privKeyHex);

// Derive testnet address (no TransactionVersion enum in v7)
const address = getAddressFromPrivateKey(privKeyHex, "testnet");
console.log("Testnet address:", address);
