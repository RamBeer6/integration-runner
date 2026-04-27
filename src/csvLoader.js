const fs = require("fs");
const path = require("path");
const readline = require("readline");

async function loadCsv(filePath) {
  if (!filePath) {
    throw new Error("CSV input path is required");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV input file not found: ${filePath}`);
  }

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let headers = null;
  const records = [];
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!headers) {
      headers = parseCsvLine(trimmed);
      validateHeaders(headers, filePath);
      continue;
    }

    const values = parseCsvLine(trimmed);

    if (values.length !== headers.length) {
      throw new Error(
        `Invalid CSV row at ${path.basename(filePath)}:${lineNumber}. Expected ${headers.length} columns, got ${values.length}`,
      );
    }

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    records.push(record);
  }

  if (!headers) {
    throw new Error(`CSV input file is empty: ${filePath}`);
  }

  return records;
}

function validateHeaders(headers, filePath) {
  if (!headers.length || headers.some((header) => !header)) {
    throw new Error(`CSV input has invalid headers: ${filePath}`);
  }
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (insideQuotes) {
    throw new Error("Invalid CSV line: unmatched quote");
  }

  values.push(current.trim());
  return values;
}

module.exports = { loadCsv, parseCsvLine };
