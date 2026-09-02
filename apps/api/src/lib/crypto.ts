import crypto from "crypto";
import config from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const PREFIX = "enc:v1:";

/**
 * Derives a consistent 32-byte (256-bit) key from the configured encryption key.
 */
function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(config.encryptionKey).digest();
}

/**
 * Encrypts sensitive text (e.g. third-party OAuth access tokens) using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return plainText;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts AES-256-GCM encrypted tokens.
 * Backwards compatible: returns the string as-is if it is not encrypted with this format.
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith(PREFIX)) {
    // Legacy unencrypted token or empty value
    return cipherText;
  }

  const parts = cipherText.slice(PREFIX.length).split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex!, "hex");
  const authTag = Buffer.from(authTagHex!, "hex");
  const encrypted = Buffer.from(encryptedHex!, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
