const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "bulean-theme";

// Smooth scroll handler
function registerSmoothScroll() {
  const anchors = document.querySelectorAll('nav a[href^="#"]');
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      const sectionId = anchor.getAttribute("href");
      document.querySelector(sectionId)?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Theme management
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light") {
    body.classList.add("theme-light");
  } else {
    body.classList.remove("theme-light");
  }
}

function toggleTheme() {
  const isLight = body.classList.toggle("theme-light");
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
}

// Render resource columns dynamically
function setCurrentYear() {
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

registerSmoothScroll();
initializeTheme();
setCurrentYear();

themeToggle.addEventListener("click", () => {
  toggleTheme();
});
