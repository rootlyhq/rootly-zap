# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Rootly's Zapier integration. Zapier app ID: 167479. All triggers, searches, and creates are **auto-generated from `swagger.json`** (Rootly's OpenAPI spec) via reflected modules — no hand-written action code.

## Commands

```bash
npm test                  # Run all tests (needs ROOTLY_API_KEY env var)
npm run validate          # Zapier structural validation (needs ~/.zapierrc with deployKey)
npm run zapier -- <cmd>   # Any Zapier CLI command (zapier-platform-cli pinned via npx, not a dependency)
npm run update-swagger    # Pull latest swagger.json from Rootly S3
npx mocha test/alert.js   # Run a single test file
```

## Architecture

### Schema-driven generation

`swagger.json` is the single source of truth. Three `reflected.js` modules read OpenAPI schemas at load time:

- `creates/reflected.js` — reads `new_<resource>` schema → generates create action with input fields, POST request, sample data
- `searches/reflected.js` — reads `<resource>_list` schema + path parameters → generates search with GET request
- `triggers/reflected.js` — reads `<resource>_list` schema → generates polling trigger with GET request

### Adding a resource

1. Ensure schema exists in `swagger.json` (`new_<name>` for creates, `<name>_list` for searches/triggers)
2. Add one line per action type in `index.js` (e.g., `incident: reflectedCreate("incident")`)
3. For creates needing dynamic dropdowns, pass `dynamic` map linking field keys to trigger refs (see incident in `index.js`)

### helpers.js

Handles two-way translation between Zapier's flat field model and JSON:API's nested structure:
- `inputSchema()` — converts OpenAPI properties to Zapier input field definitions
- `unflattenInputs()` — converts flat Zapier input back to nested JSON:API `attributes`
- `flattenResponseItem()` — flattens JSON:API response (`data.attributes`) to flat object for Zapier

### Auth

Bearer token via `authentication.js`. User provides API key, added to `Authorization` header on every request.

### Config

`config.js` reads `ROOTLY_API_URL` (defaults to `https://api.rootly.com`) and `ROOTLY_API_KEY` from environment.

## Supply chain

`.npmrc` sets `ignore-scripts=true`. Keep `zapier-platform-cli` out of `package.json` (its tree carries unfixable advisories); bump the pinned version in the `validate`/`zapier` scripts alongside `zapier-platform-core` — versions must match.

## Releasing

Bump `package.json` version + `CHANGELOG.md`, merge, push a `X.Y.Z` tag. `.github/workflows/publish.yml` validates, `zapier push`, `zapier promote`, and creates the GitHub release.

## Style

- 2 spaces, LF line endings, UTF-8
- CommonJS (`require`/`module.exports`) — not ESM
- `inflection` package used for humanizing field labels
