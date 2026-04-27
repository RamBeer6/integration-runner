# Repository Usage Notes

## Local Workflow

Use the feature branch workflow for changes:

```bash
git checkout -b feature/<short-description>
npm test
node src/index.js --input sample-data/orders.csv --concurrency 3 --retries 3 --rate-limit 5
```

## Formatting

Format the project before committing:

```bash
npx prettier . --write
```

## Reports

Runtime reports are written under `reports/` and ignored by Git except for `reports/.gitkeep`.

## Release Checklist

- Tests pass with `npm test`
- CLI demo command runs successfully
- README examples match the current CLI behavior
- Docker build works when Docker Desktop is running
