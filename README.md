# bulean Web

Frontend single-page profile for Leandro Busquets with a responsive layout, light/dark theme toggle, and accessibility improvements.

## Structure

- `index.html`: Landing page divided into hero, about, skills, and featured projects sections with semantic wrappers and `aria-labelledby` attributes.
- `styles.css`: Theme-aware design tokens plus helpers such as `.section-spacing` and `.grid-gap` for consistent spacing between grids and sections.
- `script.js`: `ThemeController` and `UIBehaviors` classes that encapsulate the theme toggle, smooth scrolling, and dynamic year rendering logic.
- `tests/`: Unit tests written for the controllers and Playwright-based e2e tests that exercise theme persistence and navigation behavior.

## Prerequisites

- Node.js 18+ (includes npm)
- `npx playwright install` (required before running `npm run test:e2e`)

## Setup

```bash
npm install
npx playwright install
```

## Development

- Run `npm run test:unit` to execute the Jest suite that covers `ThemeController` and `UIBehaviors`.
- Run `npm run test:e2e` to trigger the Playwright suite; it launches the built-in Chromium/WebKit browsers to validate the DOM interactions.
  - On this machine the WebKit/Chromium binaries currently abort during startup (`ThermalStateObserverMac` / `Abort trap: 6`), so the suite fails. Ensure the host OS supports Playwright headless browsers before re-running.
- `npm test` runs both suites sequentially.

## Notes

- Theme preference persists in `localStorage` under the key `bulean-theme`.
- Global spacing utilities (`--section-spacing`, `--grid-gap`, `.section-spacing`, `.grid-gap`) keep the layout consistent without repeating margin/padding rules.
