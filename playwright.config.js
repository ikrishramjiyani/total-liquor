const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 0,
  use: {
    headless: false,
    viewport: null,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});