# Mizen docs

The docs run on TanStack Start with Vite+ 1.5 and Nitro's Node server.
The setup follows the [Start migration guide](https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js),
[hosting guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting),
and [Vite+ migration rules](https://viteplus.dev/guide/migrate-rules).

## Development

Use Node 22.22.2+, 24.15+ or 26+, within the supported major ranges in package.json.
From the repository root:

```sh
pnpm install
pnpm dev
```

Turborepo completes the UI build before starting its watcher and the docs server.
The watcher skips its initial compile so it cannot overwrite files during the
docs dependency scan. For docs-only development, run the UI build first, then
`pnpm --filter @mizen-labs/docs dev`. The UI watcher alone also requires that build.

The docs listen on port 3000. Vite compiles app StyleX with the existing Babel
configuration; PostCSS extracts both app and UI styles. Lightning CSS then
normalizes the output in both development and production, matching the previous
Turbopack handling of numeric StyleX constants. Keep the UI build/watch
running when changing the component package's compiled exports.

`src/routes` owns routing, metadata, HTTP endpoints, and legacy redirects.
Its file names follow TanStack conventions. Route option keys retain their order
because TypeScript infers head metadata from the preceding loader.
`app` contains documentation UI and executable examples. Page source data stays
on the server; example components load through a generated dynamic-import registry.
Run `pnpm --filter @mizen-labs/docs docs:sync` after editing examples.

Routing uses Start's default hash and page-top scrolling. Automatic scroll
restoration is disabled because it also restores nested carousel and example
positions. Client-side back navigation therefore does not restore page scroll.

Next.js is retained only for real Next Link demonstrations and consumer checks.
A small router context adapter lets these examples navigate within the Start host.
The separate packed Next consumer still runs on Next itself.

## Production

```sh
pnpm --filter @mizen-labs/ui build
pnpm --filter @mizen-labs/docs build
PORT=3000 HOST=0.0.0.0 pnpm --filter @mizen-labs/docs start
```

Public documentation pages are prerendered from the component and guide registries.
Markdown, metadata, redirects, and missing-page responses remain server routes.

Deploy the complete `apps/docs/.output` directory and run
`node .output/server/index.mjs` from the docs directory. No Next server or Vite
preview process is required. Nitro's `node-server` preset supplies static assets
and the application server. Nitro is pinned to a release candidate; verify the
production HTTP tests after upgrading it. Its FastResponse optimization is disabled
so native response status handling matches the reference deployment.

ESLint, Biome/Ultracite, and Turborepo remain in place. This migration adopts Vite+
for docs development, builds, and tests without replacing repository lint policy
or package-release tooling.

## Checks

```sh
pnpm --filter @mizen-labs/docs typecheck
pnpm --filter @mizen-labs/docs lint
pnpm --filter @mizen-labs/docs test
```

Tests start a Vite+ development server by default. To check a running production
server, set `MIZEN_DOCS_TEST_URL=http://127.0.0.1:3000`. The migration suite checks
all registered component and guide endpoints, legacy redirects, missing pages,
and public agent documentation. Existing browser suites cover examples,
navigation, theme hydration, keyboard behavior, and responsive layouts.
