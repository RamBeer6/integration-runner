const assert = require("node:assert/strict");
const test = require("node:test");
const { validateJob } = require("../src/validator");

test("validateJob accepts a complete job and normalizes amount", () => {
  const result = validateJob({
    id: " 1 ",
    customer: "Alpha Ltd",
    amount: "120.50",
    endpoint: "/orders",
  });

  assert.equal(result.valid, true);
  assert.equal(result.job.id, "1");
  assert.equal(result.job.amount, 120.5);
});

test("validateJob reports missing and malformed fields", () => {
  const result = validateJob({
    id: "",
    customer: "",
    amount: "abc",
    endpoint: "orders",
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("; "), /id is required/);
  assert.match(result.errors.join("; "), /customer is required/);
  assert.match(result.errors.join("; "), /amount must be numeric/);
  assert.match(result.errors.join("; "), /endpoint must start with \//);
});
