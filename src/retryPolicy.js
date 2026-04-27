const { sleep } = require("./mockIntegration");

function shouldRetry(error, attempt, maxRetries) {
  return Boolean(error?.transient) && attempt <= maxRetries;
}

function getBackoffDelay(attempt, options = {}) {
  const baseDelayMs = options.baseDelayMs ?? 100;
  const maxDelayMs = options.maxDelayMs ?? 2_000;
  return Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
}

async function executeWithRetry(operation, options = {}) {
  const maxRetries = options.retries ?? 3;
  const logger = options.logger;
  let attempt = 0;
  let retries = 0;

  while (true) {
    attempt += 1;

    try {
      const value = await operation(attempt);
      return { value, attempts: attempt, retries };
    } catch (error) {
      if (!shouldRetry(error, attempt, maxRetries)) {
        error.attempts = attempt;
        error.retries = retries;
        throw error;
      }

      retries += 1;
      const delayMs = getBackoffDelay(attempt, options);
      logger?.info({
        status: "retrying",
        attempt,
        delayMs,
        reason: error.message,
        code: error.code,
      });
      await sleep(delayMs);
    }
  }
}

module.exports = { executeWithRetry, getBackoffDelay, shouldRetry };
