# Integration Runner

A small reliability-focused CLI for running batch integration jobs from CSV input.

I built this project to demonstrate how I approach automation work that has to deal with imperfect input, unstable external services, retries, rate limits, observability, and repeatable delivery. It is intentionally compact, but it follows the same engineering habits I would use in a production integration workflow: validate early, fail clearly, retry only when it makes sense, and leave behind a useful report.

## What It Does

Integration Runner reads integration jobs from a CSV file, validates each record, executes the valid jobs against a mock external service, and produces both console output and a structured JSON report.

The runner handles:

- CSV-based job ingestion
- record-level validation
- configurable concurrency
- retry logic with exponential backoff
- rate limiting
- transient vs. permanent failure handling
- structured execution logs
- JSON summary reports
- automated tests
- Dockerized execution
- GitHub Actions CI

## Why I Built It

Most real integration work is not difficult because the happy path is complex. It is difficult because APIs fail temporarily, providers enforce rate limits, input files contain bad records, and operators still need a clear answer at the end of the run.

This project is my way of showing that I understand those failure modes and can design a workflow that behaves predictably around them.

## Quick Start

Requirements:

- Node.js 22+
- npm

Install and test:

```bash
npm install
npm test
```

Run a successful batch:

```bash
node src/index.js --input sample-data/orders.csv --concurrency 3 --retries 3 --rate-limit 5
```

Run a batch that includes validation errors, transient failures, rate limits, and a permanent external error:

```bash
node src/index.js --input sample-data/orders-with-errors.csv --concurrency 3 --retries 3 --rate-limit 5
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

The full run report is written to:

```text
reports/run-summary.json
```

That report includes per-job status, retry counts, failure reasons, timestamps, duration, and structured logs.

## CLI Options

| Option          | Description                                    |
| --------------- | ---------------------------------------------- |
| `--input`       | Path to the CSV input file                     |
| `--concurrency` | Number of jobs allowed to run at the same time |
| `--retries`     | Maximum retry attempts for transient failures  |
| `--rate-limit`  | Maximum jobs started per second                |
| `--output`      | Path for the JSON run report                   |

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

The main modules are intentionally separated so each responsibility can be read and tested independently:

| Module                   | Responsibility                                                          |
| ------------------------ | ----------------------------------------------------------------------- |
| `src/cli.js`             | Parses CLI arguments and runtime options                                |
| `src/csvLoader.js`       | Reads CSV input and turns rows into job objects                         |
| `src/validator.js`       | Validates required fields before execution                              |
| `src/runner.js`          | Coordinates validation, execution, retries, rate limiting, and results  |
| `src/retryPolicy.js`     | Retries transient failures with exponential backoff                     |
| `src/rateLimiter.js`     | Controls how many jobs start per second                                 |
| `src/mockIntegration.js` | Simulates success, temporary failure, rate limits, and permanent errors |
| `src/logger.js`          | Emits structured JSON logs                                              |
| `src/reporters/`         | Produces console and JSON reports                                       |

More details:

- `docs/architecture.md`
- `docs/failure-handling.md`
- `docs/demo-output.md`
- `docs/repository-usage.md`

## Sample Data

| File                                 | Purpose                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| `sample-data/orders.csv`             | Valid batch for the happy path                                  |
| `sample-data/orders-with-errors.csv` | Mixed validation, transient, rate-limit, and permanent failures |
| `sample-data/empty.csv`              | Header-only input for empty-run behavior                        |

## Docker

```bash
docker build -t integration-runner .
docker run --rm integration-runner --input sample-data/orders.csv
```

## Testing

The test suite covers the core behavior:

- CSV parsing and invalid CSV rows
- missing files and empty files
- input validation
- retry policy behavior
- rate limiter spacing
- runner summary and retry metrics

Run:

```bash
npm test
```

## What This Project Shows

For someone reviewing this repository, the important part is not that it is a large system. It is not trying to be one.

The important part is that the project shows how I think about reliability in practical automation work:

- I separate validation failures from execution failures.
- I retry only transient errors.
- I keep rate limiting outside the integration service itself.
- I return a useful final report instead of only printing logs.
- I keep the code small enough to test and explain.
- I package the workflow with Docker and CI so it can run consistently.

## Resume Summary

```text
Integration Runner - Reliable Workflow Execution Engine
- Built a Node.js CLI tool for executing batch integration jobs from CSV input.
- Implemented validation, retry logic, exponential backoff, rate limiting, and structured failure handling.
- Generated JSON execution reports with success/failure metrics, retry statistics, and runtime duration.
- Added automated tests, Dockerized execution, and GitHub Actions CI.
```
