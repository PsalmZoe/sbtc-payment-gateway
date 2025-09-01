import bcrypt from "bcrypt"
import crypto from "crypto"

export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, 10)
}

export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash)
}

export function generateApiKey(): string {
  return `sk_test_${crypto.randomBytes(32).toString("hex")}`
}

export function generateClientSecret(): string {
  return `pi_${crypto.randomBytes(16).toString("hex")}_secret_${crypto.randomBytes(16).toString("hex")}`
}

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString("hex")}`
}

export function createWebhookSignature(payload: string, secret: string, timestamp: number): string {
  const signedPayload = `${timestamp}.${payload}`
  const signature = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex")

  return `t=${timestamp},v1=${signature}`
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance = 300, // 5 minutes
): boolean {
  const elements = signature.split(",")
  const timestamp = Number.parseInt(elements.find((e) => e.startsWith("t="))?.split("=")[1] || "0")
  const signatures = elements.filter((e) => e.startsWith("v1="))

  if (Date.now() / 1000 - timestamp > tolerance) {
    return false
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex")

  return signatures.some((sig) => {
    const providedSignature = sig.split("=")[1]
    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(providedSignature, "hex"))
  })
}
