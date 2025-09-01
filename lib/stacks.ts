import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCVFromString,
  uintCV,
  standardPrincipalCV,
} from "@stacks/transactions"
import { StacksTestnet } from "@stacks/network"

const network = new StacksTestnet()
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const CONTRACT_NAME = "payment-gateway"

export async function registerPaymentIntent(
  privateKey: string,
  intentId: Buffer,
  merchantPrincipal: string,
  amount: bigint,
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "register-intent",
    functionArgs: [
      bufferCVFromString(intentId.toString("hex")),
      standardPrincipalCV(merchantPrincipal),
      uintCV(amount.toString()),
    ],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  }

  const transaction = await makeContractCall(txOptions)
  const broadcastResponse = await broadcastTransaction(transaction, network)

  return broadcastResponse
}

export function generateContractId(): Buffer {
  // Generate a random 32-byte buffer for contract ID
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32)))
}

export function formatStacksAddress(address: string): string {
  // Ensure proper Stacks address format
  return address.startsWith("ST") || address.startsWith("SP") ? address : `ST${address}`
}
