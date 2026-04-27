function formatConsoleSummary(report) {
  const { summary } = report;

  return [
    "",
    "Integration Summary",
    `Total jobs: ${summary.totalJobs}`,
    `Succeeded: ${summary.succeeded}`,
    `Failed: ${summary.failed}`,
    `Retried: ${summary.retried}`,
    `Duration: ${summary.durationSeconds}s`,
  ].join("\n");
}

function printConsoleSummary(report, sink = console.log) {
  const output = formatConsoleSummary(report);
  sink(output);
  return output;
}

module.exports = { formatConsoleSummary, printConsoleSummary };
