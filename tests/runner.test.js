const assert = require("node:assert/strict");
const test = require("node:test");
const { createLogger } = require("../src/logger");
const { IntegrationError } = require("../src/mockIntegration");
const { runIntegration } = require("../src/runner");

test("runIntegration returns a useful summary with validation and retry data", async () => {
  const calls = new Map();

  const service = async (job) => {
    const attempts = (calls.get(job.id) ?? 0) + 1;
    calls.set(job.id, attempts);

    if (job.id === "2" && attempts === 1) {
      throw new IntegrationError("Temporary API failure", {
        code: "TEMPORARY_FAILURE",
        transient: true,
      });
    }

    return { status: "accepted" };
  };

  const report = await runIntegration({
    jobs: [
      { id: "1", customer: "Alpha", amount: "10", endpoint: "/orders" },
      { id: "2", customer: "Beta", amount: "20", endpoint: "/orders" },
      { id: "3", customer: "", amount: "30", endpoint: "/orders" },
    ],
    concurrency: 2,
    retries: 2,
    rateLimit: 100,
    baseDelayMs: 1,
    logger: createLogger({ enabled: false }),
    service,
  });

  assert.equal(report.summary.totalJobs, 3);
  assert.equal(report.summary.succeeded, 2);
  assert.equal(report.summary.failed, 1);
  assert.equal(report.summary.validationFailed, 1);
  assert.equal(report.summary.retried, 1);
});
