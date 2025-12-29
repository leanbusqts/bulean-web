# Changelog

## 1.0.0
- Added base page.
- Added CSS spacing utilities (`.section-spacing`, `.grid-gap`) backed by tokens to reduce duplicated margins and gaps.
- Improved accessibility of the landing (hero, skills, projects) with `aria-labelledby` and semantic wrappers while preserving the view.
- Encapsulated theme and scroll behaviors into `ThemeController` and `UIBehaviors`, exposing them for testing.
- Introduced testing infrastructure: `package.json`, `jest.config.js`, `playwright.config.js`, unit + e2e suites, and execution notes.
