const assert = require("node:assert/strict");
const test = require("node:test");
const { IntegrationError } = require("../src/mockIntegration");
const {
  executeWithRetry,
  getBackoffDelay,
  shouldRetry,
} = require("../src/retryPolicy");

test("getBackoffDelay doubles until max delay", () => {
  assert.equal(getBackoffDelay(1, { baseDelayMs: 10, maxDelayMs: 100 }), 10);
  assert.equal(getBackoffDelay(2, { baseDelayMs: 10, maxDelayMs: 100 }), 20);
  assert.equal(getBackoffDelay(5, { baseDelayMs: 10, maxDelayMs: 100 }), 100);
});

test("shouldRetry only retries transient errors within max retries", () => {
  assert.equal(shouldRetry({ transient: true }, 1, 3), true);
  assert.equal(shouldRetry({ transient: true }, 4, 3), false);
  assert.equal(shouldRetry({ transient: false }, 1, 3), false);
});

test("executeWithRetry retries transient failures", async () => {
  let calls = 0;
  const result = await executeWithRetry(
    async () => {
      calls += 1;
      if (calls < 2) {
        throw new IntegrationError("Temporary API failure", {
          transient: true,
        });
      }
      return "ok";
    },
    { retries: 3, baseDelayMs: 1, logger: { info: () => {} } },
  );

  assert.equal(result.value, "ok");
  assert.equal(result.attempts, 2);
  assert.equal(result.retries, 1);
});
