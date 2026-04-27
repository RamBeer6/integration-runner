# Failure Handling

Integration Runner demonstrates common integration failure modes:

- Malformed records are rejected by `src/validator.js`.
- Temporary API failures are retried.
- Rate limits are treated as transient errors.
- Permanent external validation errors fail without retry.

## Retry Policy

Transient errors retry until the configured `--retries` limit is reached. The backoff delay doubles after each failed attempt and is capped to avoid runaway waits.

## Rate Limiting

`src/rateLimiter.js` spaces job starts so the runner does not exceed the configured `--rate-limit` value. This keeps concurrency useful while still respecting external API capacity.
