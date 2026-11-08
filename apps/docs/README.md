# Mizen docs

Live site: [ui.mizen-labs.dev](https://ui.mizen-labs.dev/).

The docs run on TanStack Start with Vite+ 1.5 and Cloudflare Workers.
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

`src/app/routes` owns routing, metadata, HTTP endpoints, and legacy redirects.
Its file names follow TanStack conventions. Route option keys retain their order
because TypeScript infers head metadata from the preceding loader.
The source follows FSD dependency direction: `app → pages → widgets → features → entities → shared`.

- `app`: router, route adapters, application layouts, and global styles.
- `pages`: home, documentation views, and internal fixture pages.
- `widgets/site-shell`: header, sidebar, and navigation.
- `features`: theme switching, document copying, and navigation feedback.
- `entities/documentation`: models, server APIs, examples, specimens, and document UI.
- `shared`: domain-free UI, styles, and framework adapters.

Imports point downward and stay within a slice at the same layer. Use explicit
module imports and create segments only when they own real code. Page source data
stays on the server; example components load through a generated dynamic-import registry.
Run `pnpm --filter @mizen-labs/docs docs:sync` after editing examples.

The root loader sends only navigation summaries. Full component catalogs and
guide bodies stay on the server; page loaders fetch the requested document.
Route metadata lives in route files so reading a title cannot eagerly import
the homepage dashboard or internal fixtures. Component page data includes only
the names and URLs needed for adjacent-page links.

Links preload on pointer or keyboard intent. Production documentation loaders
reuse cached data until reload, explicit invalidation, or Router cache eviction.
Content is bundled with each deployment, so reload to see a new release while
browsing cached pages. Development loaders remain immediately stale so navigating
back to an edited document reads the current content.

Component loaders prepare the requested page's example modules before committing
navigation. The current document stays visible while data and examples load.
A top progress indicator appears after 200 ms; the docs shell remains interactive.

The document head preloads the Wix Madefor Text Latin variable font using Vite's
hashed asset URL. CSS reuses that request. JetBrains Mono and other language
subsets load on demand; all font faces retain `font-display: swap`.

Routing uses Start's default hash and page-top scrolling. Automatic scroll
restoration is disabled because it also restores nested carousel and example
positions. Client-side back navigation therefore does not restore page scroll.

Next.js is retained only for real Next Link demonstrations and consumer checks.
A small router context adapter lets these examples navigate within the Start host.
The separate packed Next consumer still runs on Next itself.

## Cloudflare build and preview

```sh
pnpm --filter @mizen-labs/ui build
pnpm --filter @mizen-labs/docs build
pnpm --filter @mizen-labs/docs preview
pnpm --filter @mizen-labs/docs deploy:check
```

The Cloudflare Vite plugin runs the server in the Workers runtime during both
development and production preview. It replaces the Nitro Node adapter.
Public documentation pages remain prerendered from the component and guide
registries. Markdown, metadata, redirects, and missing-page responses remain
server routes.

`wrangler.jsonc` is the source configuration. The Vite plugin produces `dist`
and `.wrangler/deploy/config.json`. Keep both outputs together when restoring
build artifacts. Turborepo caches both. Run Wrangler from this app's directory
without `--config`, so it follows the generated deployment configuration.

`deploy:check` bundles and validates the build without publishing. To publish
later, authenticate with `pnpm exec wrangler login`, then run `pnpm deploy` from
this directory. CI can use `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
secrets. No deployment runs automatically in the repository's CI workflow.
The default Worker name is `mizen-docs`; no custom domain is configured.

See Cloudflare's [TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
and [Vite+ guide](https://developers.cloudflare.com/workers/vite-plugin/vite-plus/).

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

Against a running production preview, check JavaScript budgets and preload reuse:

```sh
MIZEN_DOCS_PERFORMANCE=1 MIZEN_DOCS_TEST_URL=http://127.0.0.1:4173 pnpm --filter @mizen-labs/docs test tests/docs-performance-browser.test.ts
```

These opt-in checks require the production `/assets/` bundles. They measure decoded
JavaScript bytes, independent of transport compression, and verify that history
navigation reuses the document fetched on hover.
