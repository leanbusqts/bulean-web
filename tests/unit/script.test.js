const {
  ThemeController,
  UIBehaviors,
  AnalyticsTracker,
  registerExternalLinkTracking,
} = require("../../script.js");

describe("ThemeController", () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="themeToggle"></button>';
    localStorage.clear();
  });

  afterEach(() => {
    AnalyticsTracker.reset();
  });

  test("applies the stored light theme when available", () => {
    localStorage.setItem("bulean-theme", "light");
    const controller = new ThemeController({
      toggleButton: document.getElementById("themeToggle"),
    });
    controller.init();
    expect(document.body.classList.contains("theme-light")).toBe(true);
  });

  test("toggles theme and persists preference", () => {
    const controller = new ThemeController({
      toggleButton: document.getElementById("themeToggle"),
    });
    controller.init();
    controller.toggleTheme();
    expect(document.body.classList.contains("theme-light")).toBe(true);
    expect(localStorage.getItem("bulean-theme")).toBe("light");

    controller.toggleTheme();
    expect(document.body.classList.contains("theme-light")).toBe(false);
    expect(localStorage.getItem("bulean-theme")).toBe("dark");
  });

  test("emite evento analytics con el tema seleccionado", () => {
    const { logEvent } = createFirebaseMock();
    const controller = new ThemeController({
      toggleButton: document.getElementById("themeToggle"),
    });
    controller.init();

    controller.toggleTheme();

    expect(logEvent).toHaveBeenCalledWith("theme_toggle", { theme: "light" });
  });
});

describe("UIBehaviors", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav>
        <a href="#skills">Skills</a>
      </nav>
      <section id="skills"></section>
      <span id="currentYear"></span>
    `;
  });

  afterEach(() => {
    AnalyticsTracker.reset();
  });

  test("registers smooth scroll listeners and scrolls the target section", () => {
    const behaviors = new UIBehaviors();
    const targetSection = document.getElementById("skills");
    targetSection.scrollIntoView = jest.fn();
    const { logEvent } = createFirebaseMock();

    behaviors.registerSmoothScroll();

    document
      .querySelector('a[href="#skills"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(targetSection.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(logEvent).toHaveBeenCalledWith("navigation_click", { target: "skills" });
  });

  test("sets the current year text", () => {
    const behaviors = new UIBehaviors();
    behaviors.setCurrentYear();
    const yearElement = document.getElementById("currentYear");
    expect(yearElement.textContent).toBe(new Date().getFullYear().toString());
  });

  test("init wires behaviors and updates the year", () => {
    const behaviors = new UIBehaviors();
    const targetSection = document.getElementById("skills");
    targetSection.scrollIntoView = jest.fn();
    const { logEvent } = createFirebaseMock();

    behaviors.init();

    document
      .querySelector('a[href="#skills"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(targetSection.scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById("currentYear").textContent).toBe(
      new Date().getFullYear().toString()
    );
    expect(logEvent).toHaveBeenCalledWith("navigation_click", { target: "skills" });
  });
});

describe("registerExternalLinkTracking", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="hero-links">
        <a href="https://www.linkedin.com/in/test" target="_blank">LinkedIn Hero</a>
        <a href="https://github.com/test" target="_blank">GitHub Hero</a>
      </div>
      <div class="footer-links">
        <a href="https://www.linkedin.com/in/footer" target="_blank">LinkedIn Footer</a>
        <a href="https://github.com/footer" target="_blank">GitHub Footer</a>
      </div>
    `;
  });

  afterEach(() => {
    AnalyticsTracker.reset();
  });

  test("registra eventos al hacer click en enlaces externos del hero", () => {
    const { logEvent } = createFirebaseMock();

    registerExternalLinkTracking();

    document
      .querySelector(".hero-links a[href*='linkedin.com']")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    document
      .querySelector(".hero-links a[href*='github.com']")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(logEvent).toHaveBeenCalledWith("external_link_click", {
      platform: "linkedin",
      area: "hero",
      url: "https://www.linkedin.com/in/test",
    });
    expect(logEvent).toHaveBeenCalledWith("external_link_click", {
      platform: "github",
      area: "hero",
      url: "https://github.com/test",
    });
  });
});

function createFirebaseMock() {
  const logEvent = jest.fn();
  const analytics = jest.fn(() => ({ logEvent }));
  window.firebase = {
    analytics,
  };
  return { analytics, logEvent };
}
