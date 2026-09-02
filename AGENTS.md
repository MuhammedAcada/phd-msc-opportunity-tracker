# Repository Guidelines

## Project Structure & Module Organization

This repository powers a public-source PhD/MSc opportunity tracker and a static GitHub Pages dashboard. Source scripts live in `scripts/`: `find_leads.mjs` fetches, filters, scores, and deduplicates leads; `build_site.mjs` renders the live dashboard and downloadable CSV files. Configuration lives in `search_config.json`. Persistent lead data is stored in `data/leads.json`, while manual LinkedIn capture starts from `data/manual_linkedin_capture.csv`. Published site assets live in `docs/`. Generated workbook and preview outputs live in `outputs/`.

## Build, Test, and Development Commands

Use Node.js 24 or newer. Key commands:

```powershell
npm run find:leads
npm run build:site
npm run run:daily
node --check scripts/find_leads.mjs
node --check scripts/build_site.mjs
```

`find:leads` updates `data/leads.json` from public sources. `build:site` rebuilds `docs/index.html`, `docs/leads.csv`, and related dashboard files. `run:daily` performs both steps, matching the GitHub Actions workflow.

## Coding Style & Naming Conventions

Use modern ES modules, two-space indentation, `const` by default, and clear camelCase names for functions and variables. Keep source-specific parsing isolated in small functions such as `extractJobsAcUk` and `sourceAllowsUrl`. Store durable data keys in snake_case because they map directly to tracker columns and CSV output.

## Testing Guidelines

There is no formal test framework yet. Before committing, run both `node --check` commands and, when changing search logic, run `npm run run:daily`. Inspect `data/leads.json` for false positives and verify `docs/index.html` renders the expected lead count.

## Commit & Pull Request Guidelines

Follow the existing short, imperative commit style, for example `Build daily opportunity tracker` or `Make daily workflow push resilient`. Pull requests should summarize search/source changes, mention any new public data sources, note whether the daily workflow was tested, and include a screenshot when the dashboard UI changes.

## Security & Configuration Tips

Do not add personal emails, LinkedIn profile data, API keys, cookies, or browser session data to tracked files. LinkedIn remains manual capture only; do not automate scraping, profile extraction, or messaging. Keep blocked sources out of automated fetching unless they provide a compliant API.
