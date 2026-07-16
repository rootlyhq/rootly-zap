# rootly-zap

Rootly's [Zapier](https://zapier.com) integration. Lets users create triggers, searches, and actions for Rootly resources (incidents, alerts, pulses) inside Zapier workflows.

## How It Works

Everything is **schema-driven** from `swagger.json`. Instead of hand-writing each Zapier action, the three `reflected.js` modules (`creates/`, `searches/`, `triggers/`) read the OpenAPI schema at build time and generate Zapier-compatible input fields, API calls, and sample data automatically.

Adding a new resource = one line in `index.js` + updating the swagger file.

### Key Files

| File | Purpose |
|------|---------|
| `index.js` | App entry point — registers all triggers, searches, and creates |
| `swagger.json` | OpenAPI spec from Rootly API — source of truth for all schemas |
| `creates/reflected.js` | Generates create actions from `new_<resource>` schemas |
| `searches/reflected.js` | Generates search actions from `<resource>_list` schemas |
| `triggers/reflected.js` | Generates polling triggers from `<resource>_list` schemas |
| `helpers.js` | Schema-to-Zapier field mapping, JSON:API flattening |
| `authentication.js` | Bearer token auth via user-provided API key |

## Development

### Prerequisites

- Node.js >= 22 (use [mise](https://mise.jdx.dev) — config in `mise.toml`)
- A Rootly API key

### Setup

```bash
npm install
cp .env.example .env  # add your ROOTLY_API_KEY
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ROOTLY_API_URL` | API base URL (defaults to `https://api.rootly.com`) |
| `ROOTLY_API_KEY` | Your Rootly API key for testing |

### Commands

```bash
npm test              # Run tests
npm run validate      # Zapier structural validation
npm run update-swagger  # Pull latest swagger.json from Rootly
```

### Adding a New Resource

1. Run `npm run update-swagger` to get latest schema
2. Add entries in `index.js` under `triggers`, `searches`, and/or `creates`
3. Use `reflectedTrigger("resource_name")`, `reflectedSearch("resource_name")`, or `reflectedCreate("resource_name")`
4. For creates with dynamic dropdowns, pass a `dynamic` map (see incident example in `index.js`)

## See Also

- [Zapier Platform CLI docs](https://github.com/zapier/zapier-platform/blob/main/packages/cli/README.md)
- [Rootly API docs](https://rootly.com/api)
