const { getHelpText, parseCliArgs } = require("./cli");
const { printConsoleSummary } = require("./reporters/consoleReporter");
const { writeJsonReport } = require("./reporters/jsonReporter");
const { runIntegration } = require("./runner");

(async () => {
  try {
    const options = parseCliArgs();

    if (options.help) {
      console.log(getHelpText());
      return;
    }

    const report = await runIntegration(options);
    printConsoleSummary(report);
    await writeJsonReport(report, options.output);

    console.log(`JSON report: ${options.output}`);
  } catch (error) {
    console.error(`Integration Runner failed: ${error.message}`);
    process.exitCode = 1;
  }
})();
