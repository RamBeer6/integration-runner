# Demo Output

Run:

```bash
node src/index.js --input sample-data/orders.csv --concurrency 3 --retries 3 --rate-limit 5
```

Example summary:

```text
Integration Summary
Total jobs: 5
Succeeded: 5
Failed: 0
Retried: 0
Duration: 0.82s
```

The command also writes `reports/run-summary.json`, including per-job status, retry counts, duration, and structured logs.
