const { ThemeController, UIBehaviors } = require("../../script.js");

describe("ThemeController", () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="themeToggle"></button>';
    localStorage.clear();
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

  test("registers smooth scroll listeners and scrolls the target section", () => {
    const behaviors = new UIBehaviors();
    const targetSection = document.getElementById("skills");
    targetSection.scrollIntoView = jest.fn();

    behaviors.registerSmoothScroll();

    document
      .querySelector('a[href="#skills"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(targetSection.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
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

    behaviors.init();

    document
      .querySelector('a[href="#skills"]')
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(targetSection.scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById("currentYear").textContent).toBe(
      new Date().getFullYear().toString()
    );
  });
});
