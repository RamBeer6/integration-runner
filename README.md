# Integration Runner

A reliability-focused Node.js CLI for executing batch integration jobs from CSV input.

The runner validates records before execution, controls concurrency and request rate, retries transient failures with exponential backoff, and produces both structured logs and a JSON run report. The project is intentionally compact, with each operational concern separated into a small, testable module.

## Core Capabilities

- CSV-based job ingestion
- record-level validation
- configurable concurrency
- rate limiting
- retry logic with exponential backoff
- transient vs. permanent failure handling
- structured execution logs
- console and JSON reports
- automated tests
- Dockerized execution
- GitHub Actions CI

## Reliability Model

The workflow follows four rules:

1. Validate input before calling an external service.
2. Retry only failures classified as transient.
3. Keep rate limiting separate from the integration implementation.
4. Leave a structured report that explains the outcome of every job.

## Quick Start

### Requirements

- Node.js 22+
- npm

Install dependencies and run the test suite:

```bash
npm install
npm test
```

Run a successful batch:

```bash
node src/index.js \
  --input sample-data/orders.csv \
  --concurrency 3 \
  --retries 3 \
  --rate-limit 5
```

Run a batch containing validation errors, transient failures, rate limits, and a permanent external error:

```bash
node src/index.js \
  --input sample-data/orders-with-errors.csv \
  --concurrency 3 \
  --retries 3 \
  --rate-limit 5
```

## Example Output

```text
Integration Summary
Total jobs: 7
Succeeded: 3
Failed: 4
Retried: 3
Duration: 1.28s
```

The full report is written to:

```text
reports/run-summary.json
```

It includes per-job status, retry count, failure reason, timestamps, duration, and structured log data.

## CLI Options

| Option | Description |
|---|---|
| `--input` | Path to the CSV input file |
| `--concurrency` | Maximum number of jobs executed concurrently |
| `--retries` | Maximum retry attempts for transient failures |
| `--rate-limit` | Maximum number of jobs started per second |
| `--output` | Output path for the JSON report |

## Architecture

```text
CSV input
  -> CSV loader
  -> validation
  -> runner
      -> rate limiter
      -> retry policy
      -> mock integration service
  -> structured logs
  -> console summary + JSON report
```

| Module | Responsibility |
|---|---|
| `src/cli.js` | Parses CLI arguments and runtime options |
| `src/csvLoader.js` | Loads CSV rows and converts them into job objects |
| `src/validator.js` | Validates required fields before execution |
| `src/runner.js` | Coordinates validation, execution, retries, rate limiting, and result collection |
| `src/retryPolicy.js` | Applies retry rules and exponential backoff |
| `src/rateLimiter.js` | Controls job start rate |
| `src/mockIntegration.js` | Simulates successful, transient, rate-limited, and permanent outcomes |
| `src/logger.js` | Emits structured JSON logs |
| `src/reporters/` | Produces console and JSON reports |

Supporting documentation:

- [Architecture](docs/architecture.md)
- [Failure Handling](docs/failure-handling.md)
- [Demo Output](docs/demo-output.md)
- [Repository Usage](docs/repository-usage.md)

## Sample Data

| File | Purpose |
|---|---|
| `sample-data/orders.csv` | Valid happy-path batch |
| `sample-data/orders-with-errors.csv` | Mixed validation, transient, rate-limit, and permanent failures |
| `sample-data/empty.csv` | Header-only input for empty-run behavior |

## Docker

```bash
docker build -t integration-runner .
docker run --rm integration-runner --input sample-data/orders.csv
```

## Testing

Run:

```bash
npm test
```

The test suite covers:

- CSV parsing and malformed rows
- missing and empty files
- input validation
- retry policy behavior
- rate limiter spacing
- runner summaries and retry metrics

## Technology Stack

- Node.js
- JavaScript
- CSV processing
- JSON structured logging
- Docker
- GitHub Actions

## Engineering Decisions

- Validation failures are separated from execution failures.
- Only transient failures are retried.
- Rate limiting is isolated from service-specific logic.
- Final reports remain useful even when a batch partially fails.
- Modules are kept small enough to test and reason about independently.
