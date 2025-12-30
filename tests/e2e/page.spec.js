const path = require("path");
const { pathToFileURL } = require("url");
const { test, expect } = require("@playwright/test");

const pageUrl = pathToFileURL(path.resolve(__dirname, "../../index.html")).toString();

test.describe("Página principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__scrollTarget = null;
      window._analyticsEvents = [];
      document.addEventListener("click", (event) => {
        const target = event.target;
        if (
          target instanceof Element &&
          (target.matches(".hero-links a") || target.matches(".footer-links a"))
        ) {
          event.preventDefault();
        }
      });
      const originalScroll = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (...args) {
        window.__scrollTarget = this.id || this.getAttribute("id") || "";
        if (originalScroll) {
          originalScroll.apply(this, args);
        }
      };
      window.firebase = {
        analytics: () => ({
          logEvent(name, params) {
            window._analyticsEvents.push({ name, params });
          },
        }),
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
    const analyticsEvents = await page.evaluate(() => window._analyticsEvents);
    expect(analyticsEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "theme_toggle",
          params: { theme: "light" },
        }),
      ])
    );
  });

  test("el enlace de navegación activa scroll suave hacia la sección", async ({ page }) => {
    await page.click('nav a[href="#skills"]');
    const scrollTarget = await page.evaluate(() => window.__scrollTarget);
    expect(scrollTarget).toBe("skills");
    await expect(page.locator("#currentYear")).toHaveText(new Date().getFullYear().toString());
    const analyticsEvents = await page.evaluate(() => window._analyticsEvents);
    expect(analyticsEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "navigation_click",
          params: { target: "skills" },
        }),
      ])
    );
  });

  test("registra eventos para enlaces externos hero y footer", async ({ page }) => {
    await page.click(".hero-links a[href*='linkedin.com']");
    await page.click(".footer-links a[href*='github.com']");
    const analyticsEvents = await page.evaluate(() => window._analyticsEvents);
    expect(analyticsEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "external_link_click",
          params: { platform: "linkedin", area: "hero", url: expect.stringContaining("linkedin") },
        }),
        expect.objectContaining({
          name: "external_link_click",
          params: { platform: "github", area: "footer", url: expect.stringContaining("github") },
        }),
      ])
    );
  });
});
