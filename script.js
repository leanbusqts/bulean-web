class ThemeController {
  constructor({
    toggleButton,
    storageKey = "bulean-theme",
    body = document.body,
    storage = window.localStorage,
  } = {}) {
    this.toggleButton = toggleButton;
    this.storageKey = storageKey;
    this.body = body;
    this.storage = storage;
  }

  init() {
    this._applySavedTheme();
    if (!this.toggleButton) {
      return;
    }

    this.toggleButton.addEventListener("click", () => this.toggleTheme());
  }

  toggleTheme() {
    const isLight = this.body.classList.toggle("theme-light");
    this.storage.setItem(this.storageKey, isLight ? "light" : "dark");
  }

  _applySavedTheme() {
    const savedTheme = this.storage.getItem(this.storageKey);
    if (savedTheme === "light") {
      this.body.classList.add("theme-light");
      return;
    }

    this.body.classList.remove("theme-light");
  }
}

class UIBehaviors {
  constructor({
    smoothScrollSelector = 'nav a[href^="#"]',
    scrollOptions = { behavior: "smooth" },
    yearSelector = "#currentYear",
  } = {}) {
    this.smoothScrollSelector = smoothScrollSelector;
    this.scrollOptions = scrollOptions;
    this.yearSelector = yearSelector;
  }

  init() {
    this.registerSmoothScroll();
    this.setCurrentYear();
  }

  registerSmoothScroll() {
    const anchors = document.querySelectorAll(this.smoothScrollSelector);
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        const sectionId = anchor.getAttribute("href");
        if (!sectionId) {
          return;
        }

        document.querySelector(sectionId)?.scrollIntoView(this.scrollOptions);
      });
    });
  }

  setCurrentYear() {
    const yearElement = document.querySelector(this.yearSelector);
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
}

const themeController = new ThemeController({
  toggleButton: document.getElementById("themeToggle"),
});

const uiBehaviors = new UIBehaviors();

themeController.init();
uiBehaviors.init();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ThemeController, UIBehaviors };
}
