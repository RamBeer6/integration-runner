const REQUIRED_FIELDS = ["id", "customer", "amount", "endpoint"];

function validateJob(job) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!String(job[field] ?? "").trim()) {
      errors.push(`${field} is required`);
    }
  }

  const amount = Number(job.amount);

  if (String(job.amount ?? "").trim() && !Number.isFinite(amount)) {
    errors.push("amount must be numeric");
  }

  if (String(job.endpoint ?? "").trim() && !String(job.endpoint).startsWith("/")) {
    errors.push("endpoint must start with /");
  }

  return {
    valid: errors.length === 0,
    errors,
    job: {
      ...job,
      id: String(job.id ?? "").trim(),
      customer: String(job.customer ?? "").trim(),
      amount,
      endpoint: String(job.endpoint ?? "").trim(),
    },
  };
}

function validateJobs(jobs) {
  return jobs.map((job, index) => ({
    row: index + 2,
    ...validateJob(job),
  }));
}

module.exports = { REQUIRED_FIELDS, validateJob, validateJobs };
