# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Project demos

Two "Try it live" chat demos in the Projects section call a Cloudflare
Worker backend — see `worker/README.md` for how to deploy it.

For local development, copy `.env.example` to `.env` and point
`VITE_DEMO_API_BASE` at your worker (`http://localhost:8787` when running
`npm run dev` inside `worker/`, or your deployed `*.workers.dev` URL).

For the production build (GitHub Actions), add a repository variable named
`VITE_DEMO_API_BASE` under **Settings → Secrets and variables → Actions →
Variables**, set to your deployed worker's URL. It's not secret — just the
public API base — but keeping it as a variable (not hardcoded) means you
can point the site at a different worker without a code change.
