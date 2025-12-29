const { defineConfig } = require("@playwright/test");

const commonUse = {
  headless: true,
  viewport: { width: 1280, height: 720 },
  actionTimeout: 10 * 1000,
  trace: "on-first-retry",
};

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  projects: [
    {
      name: "webkit",
      use: {
        ...commonUse,
        browserName: "webkit",
      },
    },
  ],
});
