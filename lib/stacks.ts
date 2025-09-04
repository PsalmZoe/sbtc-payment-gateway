import {
  STACKS_TESTNET,
  STACKS_MAINNET,
} from "@stacks/network"
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCVFromString,
  uintCV,
  standardPrincipalCV,
} from "@stacks/transactions"
import crypto from "crypto"

// Networks
export const testnetNetwork = STACKS_TESTNET
export const mainnetNetwork = STACKS_MAINNET

// Smart contract info
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const CONTRACT_NAME = "payment-gateway"

// Register payment intent on-chain
export async function registerPaymentIntent(
  privateKey: string,
  intentId: Buffer,
  merchantPrincipal: string,
  amount: bigint
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "register-intent",
    functionArgs: [
      bufferCVFromString(intentId.toString("hex")),
      standardPrincipalCV(merchantPrincipal),
      uintCV(Number(amount)), // convert bigint to number
    ],
    senderKey: privateKey,
    network: testnetNetwork, // included here
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  const transaction = await makeContractCall(txOptions)

  // ✅ broadcastTransaction now takes an object
  const broadcastResponse = await broadcastTransaction({ transaction })

  return broadcastResponse
}

// Utility to generate contract ID
export function generateContractId(): Buffer {
  return crypto.randomBytes(32)
}

// Utility to format Stacks address
export function formatStacksAddress(address: string): string {
  return address.startsWith("ST") || address.startsWith("SP") ? address : `ST${address}`
}
