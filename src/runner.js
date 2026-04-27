const { loadCsv } = require("./csvLoader");
const { createLogger } = require("./logger");
const { createMockIntegrationService } = require("./mockIntegration");
const { RateLimiter } = require("./rateLimiter");
const { executeWithRetry } = require("./retryPolicy");
const { validateJobs } = require("./validator");

async function runIntegration(options) {
  const startedAt = Date.now();
  const logger = options.logger ?? createLogger();
  const service = options.service ?? createMockIntegrationService();
  const rateLimiter =
    options.rateLimiter ?? new RateLimiter(options.rateLimit ?? 5);

  logger.info({ status: "run_started", input: options.input });

  const jobs = options.jobs ?? (await loadCsv(options.input));
  const validated = validateJobs(jobs);
  const results = [];
  const executable = [];

  for (const item of validated) {
    if (!item.valid) {
      const failed = {
        jobId: item.job.id || `row-${item.row}`,
        row: item.row,
        status: "failed",
        attempts: 0,
        retries: 0,
        errorType: "validation",
        error: item.errors.join("; "),
      };

      results.push(failed);
      logger.info({
        jobId: failed.jobId,
        status: "validation_failed",
        row: item.row,
        reason: failed.error,
      });
      continue;
    }

    executable.push(item.job);
  }

  const executed = await runWithConcurrency(
    executable,
    options.concurrency ?? 3,
    async (job) => {
      logger.info({ jobId: job.id, status: "started" });

      try {
        const execution = await executeWithRetry(
          (attempt) =>
            rateLimiter.schedule(async () => {
              logger.info({ jobId: job.id, status: "attempting", attempt });
              return service(job);
            }),
          {
            retries: options.retries ?? 3,
            baseDelayMs: options.baseDelayMs,
            maxDelayMs: options.maxDelayMs,
            logger: {
              info: (event) => logger.info({ jobId: job.id, ...event }),
            },
          },
        );

        logger.info({
          jobId: job.id,
          status: "succeeded",
          attempts: execution.attempts,
        });

        return {
          jobId: job.id,
          status: "succeeded",
          attempts: execution.attempts,
          retries: execution.retries,
          response: execution.value,
        };
      } catch (error) {
        logger.info({
          jobId: job.id,
          status: "failed",
          attempts: error.attempts ?? 1,
          reason: error.message,
          code: error.code,
        });

        return {
          jobId: job.id,
          status: "failed",
          attempts: error.attempts ?? 1,
          retries: error.retries ?? 0,
          errorType: error.transient ? "transient" : "permanent",
          error: error.message,
          code: error.code,
        };
      }
    },
  );

  results.push(...executed);

  const finishedAt = Date.now();
  const summary = buildSummary(results, finishedAt - startedAt);
  logger.info({ status: "run_finished", ...summary });

  return {
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date(finishedAt).toISOString(),
    durationMs: finishedAt - startedAt,
    summary,
    results,
    logs: logger.entries,
  };
}

async function runWithConcurrency(items, concurrency, handler) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await handler(items[currentIndex]);
    }
  }

  const workerCount = Math.min(Math.max(concurrency, 1), items.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}

function buildSummary(results, durationMs) {
  const succeeded = results.filter(
    (result) => result.status === "succeeded",
  ).length;
  const failed = results.filter((result) => result.status === "failed").length;
  const retried = results.reduce((total, result) => total + result.retries, 0);
  const validationFailed = results.filter(
    (result) => result.errorType === "validation",
  ).length;

  return {
    totalJobs: results.length,
    succeeded,
    failed,
    validationFailed,
    retried,
    durationMs,
    durationSeconds: Number((durationMs / 1_000).toFixed(2)),
  };
}

module.exports = { buildSummary, runIntegration, runWithConcurrency };
