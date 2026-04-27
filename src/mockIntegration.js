class IntegrationError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "IntegrationError";
    this.code = options.code ?? "INTEGRATION_ERROR";
    this.statusCode = options.statusCode ?? 500;
    this.transient = options.transient ?? false;
  }
}

function createMockIntegrationService(options = {}) {
  const attemptsByJobId = new Map();
  const latencyMs = options.latencyMs ?? 25;

  return async function sendJob(job) {
    const attempts = (attemptsByJobId.get(job.id) ?? 0) + 1;
    attemptsByJobId.set(job.id, attempts);

    await sleep(latencyMs);

    if (job.endpoint.includes("validation-error")) {
      throw new IntegrationError("External service rejected the payload", {
        code: "VALIDATION_ERROR",
        statusCode: 422,
        transient: false,
      });
    }

    if (job.endpoint.includes("rate-limit") && attempts <= 2) {
      throw new IntegrationError("External service rate limit", {
        code: "RATE_LIMITED",
        statusCode: 429,
        transient: true,
      });
    }

    if (job.endpoint.includes("unstable") && attempts === 1) {
      throw new IntegrationError("Temporary API failure", {
        code: "TEMPORARY_FAILURE",
        statusCode: 503,
        transient: true,
      });
    }

    return {
      externalId: `ext-${job.id}`,
      acceptedAt: new Date().toISOString(),
      status: "accepted",
    };
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { IntegrationError, createMockIntegrationService, sleep };
