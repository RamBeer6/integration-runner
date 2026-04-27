const assert = require("node:assert/strict");
const test = require("node:test");
const { RateLimiter } = require("../src/rateLimiter");

test("RateLimiter spaces scheduled jobs", async () => {
  const limiter = new RateLimiter(20);
  const startedAt = Date.now();

  await Promise.all([
    limiter.schedule(async () => Date.now()),
    limiter.schedule(async () => Date.now()),
    limiter.schedule(async () => Date.now()),
  ]);

  assert.ok(Date.now() - startedAt >= 90);
});

test("RateLimiter rejects invalid limits", () => {
  assert.throws(() => new RateLimiter(0), /positive integer/);
});
