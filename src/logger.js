function createLogger(options = {}) {
  const sink = options.sink ?? console.log;
  const enabled = options.enabled ?? true;
  const entries = [];

  function info(event) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: "info",
      ...event,
    };

    entries.push(entry);

    if (enabled) {
      sink(JSON.stringify(entry));
    }

    return entry;
  }

  return {
    info,
    entries,
  };
}

module.exports = { createLogger };
