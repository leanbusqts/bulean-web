const os = require("os");
const { defineConfig } = require("@playwright/test");

if (
  process.platform === "darwin" &&
  process.arch === "arm64" &&
  !process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE
) {
  const darwinMajor = parseInt(os.release().split(".")[0], 10);
  const lastStableMacVersion = 15;
  const macVersion = Math.min(Math.max(darwinMajor - 9, 10), lastStableMacVersion);
  process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = `mac${macVersion}-arm64`;
}

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
      name: "firefox",
      use: {
        ...commonUse,
        browserName: "firefox",
      },
    },
  ],
});
