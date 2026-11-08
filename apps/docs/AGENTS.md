# Docs app

The docs use TanStack Start, Vite+ and Nitro's Node server.

- `src/routes` owns public routes, metadata, redirects and HTTP endpoints.
- `app` contains the existing documentation UI and executable examples.
- Keep source registries on the server; use `src/docs-functions.ts` for page data.
- Run `pnpm docs:sync` after changing examples. Do not edit generated registries.
- Next.js remains a development dependency for genuine Next Link examples and consumer checks. It does not build or serve the docs.
- Keep ESLint's StyleX, React and complexity rules, and the repository's Biome checks.
- Validate with `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
- `pnpm start` serves `.output/server/index.mjs`; use `PORT` and `HOST` for deployment.
