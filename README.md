# xlsvc Frontend

React SPA for the xlsvc Excel batch row deletion tool.

## URLs

| Environment | URL |
|-------------|-----|
| Dev | `http://localhost:5173/` (landing) / `http://localhost:5173/app` (dashboard) |
| Prod | `https://xlsvc.jsilverman.ca/` (landing) / `https://xlsvc.jsilverman.ca/app/` (dashboard) |
| API (dev) | `http://127.0.0.1:5000/api` |
| API (prod) | `https://api.xlsvc.jsilverman.ca/api` |

## Stack

- React 19 + React Router v6
- Vite 7 (dev server + build)
- styled-components + Tailwind CSS
- axios for HTTP
- Vitest + React Testing Library (unit)
- Playwright (E2E)

## Getting Started

```bash
npm install
npm run dev          # Start dev server on http://localhost:5173
```

Backend must be running at `http://127.0.0.1:5000` for API calls to work.

## Testing

```bash
npm run test:unit              # Run unit tests
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage report
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Playwright UI mode
npm run test:coverage          # Both unit + E2E
```

### Coverage Thresholds

- **Unit** (Vitest): lines 100%, statements 100%, branches 100%, functions 98.5%
- **E2E** (Playwright + monocart-reporter): all 100%

## Project Structure

```
src/
  App.jsx              Main app (auth, dashboard, admin panel)
  apiBase.js           API base URL (dev/prod)
  main.jsx             Entry point
  components/
    FilterConfiguration.jsx    Filter rule builder UI
    GeneratedFiles.jsx         Download generated files
    LandingPage.jsx            React landing page component
    ProcessingHistory.jsx      Processing job history
  styled/
    theme.js             Dark theme definition
    AuthComponents.js    Login/register styles
    BaseComponents.js    Buttons, inputs, cards
    CardComponents.js    Content cards
    DashboardComponents.js  Dashboard layout
    FileComponents.js    File list styles
    ProcessingComponents.js  Processing UI
    UploadComponents.js  File upload styles
  utils/
    getApiErrorMessage.js  Error extraction helper

public/
  landing.html         Static SEO landing page (served at /)

tests/
  vitest.config.js     Vitest configuration
  vitest.setup.js      Test setup (mocks, cleanup)
  unit/                Unit tests (Vitest + RTL)
  e2e/                 E2E tests (Playwright)
```

## Build & Deploy

```bash
npm run build        # Build to dist/
```

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
1. Tests must pass on `main` branch first
2. Builds the app and uploads to shared hosting via SSH/rsync
3. React app goes to `/app/` subfolder, `landing.html` stays at root

## Related

- **Backend repo**: `../xlsvc/` (Flask API)
- **Project overview**: `../PROJECT_OVERVIEW.md`
