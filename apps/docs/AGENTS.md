# Docs app

The docs use TanStack Start, Vite+ and the Cloudflare Vite plugin.

- Follow `app → pages → widgets → features → entities → shared`. Imports point downward; same-layer imports stay within a slice.
- `src/app` owns TanStack routes, router initialization, global styles, and application layouts.
- `src/pages` owns route-level views and internal fixture pages.
- `src/widgets/site-shell` owns the header, sidebar, and site navigation.
- `src/features` owns theme switching, document copying, and navigation feedback.
- `src/entities/documentation` owns documentation models, server data, executable examples, and document UI.
- `src/shared` contains domain-free UI, styles, and framework adapters.
- Keep source registries on the server; use `src/entities/documentation/api/docs-functions.ts` for page data.
- Use explicit module imports. Create `api`, `model`, `lib`, and `ui` segments only when needed. Do not add empty layers or speculative barrels.
- Run `pnpm docs:sync` after changing examples. Do not edit generated registries.
- Next.js remains a development dependency for genuine Next Link examples and consumer checks. It does not build or serve the docs.
- Keep ESLint's StyleX, React and complexity rules, and the repository's Biome checks.
- Validate with `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
- `pnpm preview` runs the built app locally in the Workers runtime.
- Verify `pnpm build` and `pnpm deploy:check` before deployment. The latter is a dry run.
- Keep `dist` and `.wrangler/deploy/config.json` together. Do not force Wrangler to use the source config during deployment.
