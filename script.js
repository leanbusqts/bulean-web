const AnalyticsTracker = (() => {
  let analyticsInstance;

  function getAnalytics() {
    if (!analyticsInstance && window.firebase && typeof firebase.analytics === "function") {
      analyticsInstance = firebase.analytics();
    }
    return analyticsInstance;
  }

  function logEvent(eventName, params = {}) {
    const analytics = getAnalytics();
    if (!analytics) {
      return;
    }
    analytics.logEvent(eventName, params);
  }

  function reset() {
    analyticsInstance = null;
  }

  return {
    logEvent,
    reset,
  };
})();

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
    AnalyticsTracker.logEvent("theme_toggle", {
      theme: isLight ? "light" : "dark",
    });
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
        const normalizedTarget = sectionId.replace("#", "") || "unknown";
        AnalyticsTracker.logEvent("navigation_click", {
          target: normalizedTarget,
        });
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
registerExternalLinkTracking();

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ThemeController,
    UIBehaviors,
    AnalyticsTracker,
    registerExternalLinkTracking,
  };
}

function registerExternalLinkTracking() {
  const linkConfigs = [
    {
      selector: ".hero-links a[href*='linkedin.com']",
      platform: "linkedin",
      area: "hero",
    },
    {
      selector: ".hero-links a[href*='github.com']",
      platform: "github",
      area: "hero",
    },
    {
      selector: ".footer-links a[href*='linkedin.com']",
      platform: "linkedin",
      area: "footer",
    },
    {
      selector: ".footer-links a[href*='github.com']",
      platform: "github",
      area: "footer",
    },
  ];

  linkConfigs.forEach(({ selector, platform, area }) => {
    document.querySelectorAll(selector).forEach((link) => {
      link.addEventListener("click", () => {
        AnalyticsTracker.logEvent("external_link_click", {
          platform,
          area,
          url: link.href,
        });
      });
    });
  });
}
