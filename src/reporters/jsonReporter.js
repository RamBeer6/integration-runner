const fs = require("fs/promises");
const path = require("path");

async function writeJsonReport(report, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  return outputPath;
}

module.exports = { writeJsonReport };
