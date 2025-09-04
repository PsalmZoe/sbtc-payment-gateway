const { StacksTestnet } = require('@stacks/network');
const { getAddressFromPrivateKey, derivePrivateKey } = require('@stacks/transactions');

// Your 24-word mnemonic
const MNEMONIC = "member bronze express share claim exhibit fox sing fix remember device bike weasel pause wasp wrist they firm nephew hand latin kitten yellow shuffle";

// Derivation path for first account
const DERIVATION_PATH = "m/44'/5757'/0'/0/0";

// Derive private key
const privateKey = derivePrivateKey(MNEMONIC, DERIVATION_PATH);

// Convert private key to testnet address
const testnetAddress = getAddressFromPrivateKey(privateKey, false); // false => testnet

console.log("Testnet STX Address:", testnetAddress);
console.log("Private Key (hex):", privateKey);
