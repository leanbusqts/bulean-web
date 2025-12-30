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

class ToastController {
  constructor({
    element,
    visibleClass = "toast-visible",
    duration = 2600,
  } = {}) {
    this.element = element;
    this.visibleClass = visibleClass;
    this.duration = duration;
    this.hideTimeout = null;
  }

  show(message) {
    if (!this.element) {
      return;
    }

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    if (message) {
      this.element.textContent = message;
    }

    this.element.classList.add(this.visibleClass);
    this.hideTimeout = window.setTimeout(() => this.hide(), this.duration);
  }

  hide() {
    if (!this.element) {
      return;
    }

    this.element.classList.remove(this.visibleClass);
    this.hideTimeout = null;
  }
}

const themeController = new ThemeController({
  toggleButton: document.getElementById("themeToggle"),
});

const uiBehaviors = new UIBehaviors();
const toastController = new ToastController({
  element: document.getElementById("toast"),
});

themeController.init();
uiBehaviors.init();
registerExternalLinkTracking();
registerProjectInteractions(toastController);

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ThemeController,
    UIBehaviors,
    ToastController,
    AnalyticsTracker,
    registerExternalLinkTracking,
    registerProjectInteractions,
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
    {
      selector: ".footer-links a[href*='play.google.com']",
      platform: "google_play",
      area: "footer",
    },
    {
      selector: ".project-card-link[href*='play.google.com']",
      platform: "google_play",
      area: "projects",
    },
    {
      selector: ".project-card-link[href*='github.com']",
      platform: "github",
      area: "projects",
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

function registerProjectInteractions(toastController) {
  document.querySelectorAll(".project-card-link").forEach((card) => {
    const projectName = card.dataset.projectName || "unknown";
    card.addEventListener("click", () => {
      AnalyticsTracker.logEvent("project_link_click", {
        project: projectName,
        url: card.href,
      });
    });
  });

  document.querySelectorAll(".project-card-action").forEach((card) => {
    const projectName = card.dataset.projectName || "unknown";
    const action = card.dataset.action || "action";
    const message = card.dataset.toastMessage || "work in progress";

    const handleAction = () => {
      if (toastController) {
        toastController.show(message);
      }
      AnalyticsTracker.logEvent("project_action_click", {
        project: projectName,
        action,
      });
    };

    card.addEventListener("click", handleAction);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleAction();
      }
    });
  });
}
