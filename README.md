# Integration Runner

Reliable workflow execution engine for batch integrations.

Integration Runner is a Node.js CLI tool that executes batch integration jobs from CSV input with retries, exponential backoff, rate limiting, structured logs, and JSON reports.

## Why This Project Exists

Real-world integrations often fail due to temporary API errors, rate limits, malformed records, or unstable external services. This project simulates these conditions and demonstrates how to build resilient automation workflows.

## Features

- CSV-based job ingestion
- Input validation
- Mock external integration service
- Retry policy with exponential backoff
- Configurable rate limiting
- Structured execution logs
- Console summary
- JSON report generation
- Dockerized execution
- Automated tests and CI pipeline

## Quick Start

```bash
npm install
npm test
node src/index.js --input sample-data/orders.csv --concurrency 3 --retries 3 --rate-limit 5
```

## CLI Options

```text
--input        Path to the CSV input file
--concurrency  Number of jobs to execute at the same time
--retries      Retry attempts for transient failures
--rate-limit   Maximum jobs started per second
--output       Path for the JSON run report
```

## Example

```bash
node src/index.js --input sample-data/orders-with-errors.csv --concurrency 3 --retries 3 --rate-limit 5
```

Example output:

```text
Integration Summary
Total jobs: 7
Succeeded: 3
Failed: 4
Retried: 3
Duration: 2.1s
```

The run writes a structured report to `reports/run-summary.json`.

## Docker

```bash
docker build -t integration-runner .
docker run --rm integration-runner --input sample-data/orders.csv
```

## Architecture

```text
CSV input
-> validation
-> job execution
-> mock API call
-> retries + exponential backoff
-> rate limiting
-> structured logs
-> JSON report
```

More detail is available in:

- `docs/architecture.md`
- `docs/failure-handling.md`
- `docs/demo-output.md`

## Portfolio Positioning

This project demonstrates practical reliability engineering for backend automation and DevOps workflows:

- handling bad input before execution
- recovering from transient external failures
- respecting API rate limits
- producing audit-friendly logs and reports
- packaging the project with tests, Docker, and CI

Resume-ready summary:

```text
Integration Runner - Reliable Workflow Execution Engine
- Built a Node.js CLI tool for executing batch integration jobs from CSV input.
- Implemented retry logic, exponential backoff, rate limiting, validation, and failure handling for unstable external services.
- Generated structured execution reports with success/failure metrics, retry statistics, and runtime duration.
- Added automated tests, Dockerized execution, and GitHub Actions CI to validate reliability.
```

## What I Learned

Building Integration Runner reinforces how production automation depends on careful failure handling, observable execution, and repeatable delivery. The goal is not to build an enterprise workflow engine; it is to show the habits needed to design integrations that can fail, recover, and be explained clearly.
