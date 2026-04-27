const path = require("path");

const DEFAULT_OPTIONS = {
  input: "sample-data/orders.csv",
  concurrency: 3,
  retries: 3,
  rateLimit: 5,
  output: "reports/run-summary.json",
};

const NUMBER_FLAGS = new Set(["concurrency", "retries", "rateLimit"]);

function normalizeFlagName(flag) {
  return flag
    .replace(/^--/, "")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function parseCliArgs(argv = process.argv.slice(2), cwd = process.cwd()) {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      return { ...options, help: true };
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const [rawFlag, inlineValue] = arg.split("=");
    const key = normalizeFlagName(rawFlag);
    const value = inlineValue ?? argv[index + 1];

    if (!(key in options)) {
      throw new Error(`Unknown option: ${rawFlag}`);
    }

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${rawFlag}`);
    }

    if (inlineValue === undefined) {
      index += 1;
    }

    options[key] = NUMBER_FLAGS.has(key)
      ? parsePositiveInteger(key, value)
      : value;
  }

  return {
    ...options,
    input: path.resolve(cwd, options.input),
    output: path.resolve(cwd, options.output),
  };
}

function parsePositiveInteger(name, value) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    const flag = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    throw new Error(`Option --${flag} must be a positive integer`);
  }

  return parsed;
}

function getHelpText() {
  return [
    "Integration Runner",
    "",
    "Usage:",
    "  node src/index.js --input sample-data/orders.csv --concurrency 3 --retries 3 --rate-limit 5",
    "",
    "Options:",
    "  --input        Path to the CSV input file",
    "  --concurrency  Number of jobs to execute at the same time",
    "  --retries      Retry attempts for transient failures",
    "  --rate-limit   Maximum jobs started per second",
    "  --output       Path for the JSON run report",
  ].join("\n");
}

module.exports = { DEFAULT_OPTIONS, parseCliArgs, getHelpText };
