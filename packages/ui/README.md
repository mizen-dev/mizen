# @mizen-labs/ui

React components for product interfaces: forms, data, charts, overlays, and
agent workflows. Built on Base UI for behavior and accessibility, and StyleX
for styles.

## Install

The manifest targets version 0.1.0. No public npm release is available yet.
Pack the candidate from the repository, then install it in your existing app:

```sh
# Repository:
pnpm --filter @mizen-labs/ui pack --out /tmp/mizen-ui.tgz
# Consumer app:
npm install /tmp/mizen-ui.tgz
```

React and ReactDOM must satisfy `^19.2.8`. Import the compiled stylesheet once:

```tsx
import "@mizen-labs/ui/styles.css";
```

Components load their own structural CSS. No consumer Babel or PostCSS plugins
are required. The atomic stylesheet covers the whole package; it does not shrink
based on component imports. Plain React + Vite needs no special bundling setting. Wrap its mounted tree in
ThemeProvider, import the stylesheet, and call initializeTheme from
@mizen-labs/ui/theme/initialize before createRoot in src/main.jsx or src/main.tsx. Next
and TanStack Start each need one setting:

- Next: `transpilePackages: ["@mizen-labs/ui"]`
- TanStack Start: `ssr: { noExternal: ["@mizen-labs/ui"] }` in the Vite config

For Next and Start, render `ThemeScript` in the document head and wrap the app in `ThemeProvider`,
both from `@mizen-labs/ui/theme`. The app owns its global defaults and fonts.
App-owned StyleX styles or custom `createTheme` overrides need a separate StyleX
compiler setup. The package stylesheet includes the default light and dark themes.

## Use

```tsx
import { Button, Stack, Text } from "@mizen-labs/ui";

export function Welcome() {
  return (
    <Stack gap="3">
      <Text>Your workspace is ready.</Text>
      <Button variant="brand">Create project</Button>
    </Stack>
  );
}
```

Components accept no `className` or `style`. Choose variants and sizes
through props, and lay out with `Stack`, `Inline`, and `Grid`.

## Optional diagrams

Install `pele` alongside Mizen to use `Diagram` from `@mizen-labs/ui/diagram`.
Pele is an optional peer dependency. The root import does not load it, and each
supported grammar loads when needed. Diagram is a Preview integration for
read-only flowcharts, sequences, entity relationships, and state transitions.

## Status

Pre-1.0: minor versions can change the API.

## License

MIT
