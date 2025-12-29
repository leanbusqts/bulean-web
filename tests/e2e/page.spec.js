const path = require("path");
const { pathToFileURL } = require("url");
const { test, expect } = require("@playwright/test");

const pageUrl = pathToFileURL(path.resolve(__dirname, "../../index.html")).toString();

test.describe("Página principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__scrollTarget = null;
      const originalScroll = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (...args) {
        window.__scrollTarget = this.id || this.getAttribute("id") || "";
        if (originalScroll) {
          originalScroll.apply(this, args);
        }
      };
    });
    await page.goto(pageUrl);
  });

  test("elige tema claro y lo persiste en localStorage", async ({ page }) => {
    await expect(page.locator("body")).not.toHaveClass(/theme-light/);
    await page.click("#themeToggle");
    await expect(page.locator("body")).toHaveClass(/theme-light/);
    let storedTheme = await page.evaluate(() => localStorage.getItem("bulean-theme"));
    expect(storedTheme).toBe("light");
    await page.click("#themeToggle");
    await expect(page.locator("body")).not.toHaveClass(/theme-light/);
    storedTheme = await page.evaluate(() => localStorage.getItem("bulean-theme"));
    expect(storedTheme).toBe("dark");
  });

  test("el enlace de navegación activa scroll suave hacia la sección", async ({ page }) => {
    await page.click('nav a[href="#skills"]');
    const scrollTarget = await page.evaluate(() => window.__scrollTarget);
    expect(scrollTarget).toBe("skills");
    await expect(page.locator("#currentYear")).toHaveText(new Date().getFullYear().toString());
  });
});
