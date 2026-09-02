import assert from "node:assert/strict";
import test from "node:test";
import { Request, Response } from "express";
import rateLimit from "./rateLimit";

function response() {
  const result = { statusCode: 200, body: undefined as unknown };
  const res = {
    setHeader() {
      return this;
    },
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(body: unknown) {
      result.body = body;
      return this;
    },
  } as unknown as Response;
  return { res, result };
}

test("rate limiter rejects requests after the configured allowance", () => {
  const limit = rateLimit({ windowMs: 60_000, max: 1 });
  const req = { ip: "127.0.0.1" } as Request;
  let nextCalls = 0;
  const next = () => {
    nextCalls += 1;
  };

  const first = response();
  limit(req, first.res, next);
  const second = response();
  limit(req, second.res, next);

  assert.equal(nextCalls, 1);
  assert.equal(second.result.statusCode, 429);
  assert.deepEqual(second.result.body, {
    success: false,
    message: "Too many requests. Please try again later.",
  });
});
