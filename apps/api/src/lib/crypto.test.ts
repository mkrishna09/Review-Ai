import assert from "node:assert/strict";
import test from "node:test";
import { encryptToken, decryptToken } from "./crypto";

test("crypto: encryptToken and decryptToken roundtrip successfully", () => {
  const secret = "gho_testToken1234567890abcdefghijklmnopqrstuv";
  const encrypted = encryptToken(secret);

  assert.notEqual(encrypted, secret);
  assert.match(encrypted, /^enc:v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);

  const decrypted = decryptToken(encrypted);
  assert.equal(decrypted, secret);
});

test("crypto: decryptToken returns legacy plaintext unencrypted tokens as-is", () => {
  const legacyToken = "gho_plainLegacyToken123";
  const decrypted = decryptToken(legacyToken);
  assert.equal(decrypted, legacyToken);
});

test("crypto: decryptToken throws on tampered ciphertext", () => {
  const secret = "gho_testSecretPayload";
  const encrypted = encryptToken(secret);
  // Tamper with the ciphertext part
  const parts = encrypted.split(":");
  parts[parts.length - 1] = "deadbeef" + parts[parts.length - 1];
  const tampered = parts.join(":");

  assert.throws(() => {
    decryptToken(tampered);
  });
});
