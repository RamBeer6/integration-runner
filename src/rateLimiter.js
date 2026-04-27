const { sleep } = require("./mockIntegration");

class RateLimiter {
  constructor(limitPerSecond) {
    if (!Number.isInteger(limitPerSecond) || limitPerSecond < 1) {
      throw new Error("rate limit must be a positive integer");
    }

    this.intervalMs = 1_000 / limitPerSecond;
    this.nextAvailableAt = 0;
    this.queue = Promise.resolve();
  }

  async waitForTurn() {
    const scheduled = this.queue.then(async () => {
      const now = Date.now();
      const waitMs = Math.max(0, this.nextAvailableAt - now);

      if (waitMs > 0) {
        await sleep(waitMs);
      }

      this.nextAvailableAt = Math.max(Date.now(), this.nextAvailableAt) + this.intervalMs;
    });

    this.queue = scheduled.catch(() => {});
    return scheduled;
  }

  async schedule(task) {
    await this.waitForTurn();
    return task();
  }
}

module.exports = { RateLimiter };
