# @mizen-labs/ui

[Documentation and examples](https://ui.mizen-labs.dev/).

React components for product interfaces: forms, data, charts, overlays, and
agent workflows. Built on Base UI for behavior and accessibility, and StyleX
for styles.

## Install

Install the package in your React app:

```sh
npm install @mizen-labs/ui
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
The package stylesheet includes the default light and dark themes, and every
token as a CSS variable such as `--mizen-color-content` and `--mizen-space-4`.
Style your own elements with those variables in plain CSS. To change a themed
token, declare it again on `:root` after the Mizen stylesheet:

```css
:root {
  --mizen-color-accent: oklch(0.5 0.2 260);
  --mizen-font-mono: "JetBrains Mono Variable", ui-monospace, monospace;
}
```

Set your interface font on `body`; components inherit it. `--mizen-font-mono`
sets the family for code.

The app needs no StyleX setup.

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

## Agents

The package ships its agent skill at `skills/mizen-ui/SKILL.md`. Point your
coding agent at the copy in `node_modules/@mizen-labs/ui`: it describes the
version you have installed, not the latest one.

The CLI of the same version prints each component's import, props, and
guidance:

```sh
npx @mizen-labs/cli@<installed version> info button
```

## Optional diagrams

Install `pele` alongside Mizen to use `Diagram` from `@mizen-labs/ui/diagram`.
Pele is an optional peer dependency. The root import does not load it, and each
supported grammar loads when needed. Diagram is a Preview integration for
read-only flowcharts, sequences, entity relationships, and state transitions.

## Status

Pre-1.0: minor versions can change the API.

## License

MIT
