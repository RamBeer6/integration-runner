const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { loadCsv, parseCsvLine } = require("../src/csvLoader");

test("parseCsvLine handles quoted commas", () => {
  assert.deepEqual(parseCsvLine('1,"Alpha, Ltd",120.50,/orders'), [
    "1",
    "Alpha, Ltd",
    "120.50",
    "/orders",
  ]);
});

test("loadCsv reads records from a valid CSV", async () => {
  const records = await loadCsv(path.resolve("sample-data/orders.csv"));

  assert.equal(records.length, 5);
  assert.deepEqual(records[0], {
    id: "1",
    customer: "Alpha Ltd",
    amount: "120.50",
    endpoint: "/orders",
  });
});

test("loadCsv throws a clear error for a missing file", async () => {
  await assert.rejects(
    () => loadCsv("missing.csv"),
    /CSV input file not found/,
  );
});

test("loadCsv rejects rows with the wrong number of columns", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "integration-runner-"));
  const csvPath = path.join(dir, "bad.csv");
  await fs.writeFile(csvPath, "id,customer\n1,Alpha,extra\n", "utf8");

  await assert.rejects(() => loadCsv(csvPath), /Invalid CSV row/);
});

test("loadCsv rejects an empty physical file", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "integration-runner-"));
  const csvPath = path.join(dir, "empty.csv");
  await fs.writeFile(csvPath, "", "utf8");

  await assert.rejects(() => loadCsv(csvPath), /CSV input file is empty/);
});

test("loadCsv rejects unmatched quotes in a row", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "integration-runner-"));
  const csvPath = path.join(dir, "bad-quotes.csv");
  await fs.writeFile(
    csvPath,
    'id,customer,amount,endpoint\n1,"Alpha Ltd,120.50,/orders\n',
    "utf8",
  );

  await assert.rejects(() => loadCsv(csvPath), /unmatched quote/);
});
