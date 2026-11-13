# @mizen-labs/cli

## 0.3.0

### Minor Changes

- 4536da6: `mizen init --preset vivid` writes `mizen-theme.css` into the app and imports it after the Mizen stylesheet. The file sets `--mizen-*` token variables and belongs to the app: Vivid fills the primary action with the accent, tints the selection and deepens the status colors. The option also works on an app that is already set up. Init never replaces a theme file that differs from the preset.

### Patch Changes

- eb428d9: `mizen doctor` verifies more setups without running them. Bundling passes for a Vite or Next config function that ends with one `return` of an object literal. The Start theme passes when the one `createRouter` call renders `{children}` inside `ThemeProvider` in `Wrap` or `InnerWrap`. Doctor is also stricter: `ThemeScript` and `ThemeProvider` under a condition or inside an attribute no longer pass, and a Vite config that sets `ssr.external` stays unverified unless the list is literal and omits Mizen. A workspace root that is also an app now points to `--workspace`. Unverified bundling and theme diagnostics name what doctor reads and the evidence to check by hand.

## 0.2.0

### Minor Changes

- 64520ae: `mizen info` and `mizen search` now compare their catalog with the `@mizen-labs/ui` your app has installed. When the versions differ, they print a warning on stderr with the command for the installed version, `npx @mizen-labs/cli@<version> …`. When the installed package has no export for the component, `info` fails with the new reason `unavailable` (exit 1) instead of describing an import your app does not have.
  
  Both commands accept `--cwd <DIR>` and add `installedUiVersion` to their JSON data. Text output of `info` has a `Version` row. Discovery now reads one project file, the installed `@mizen-labs/ui` manifest; it still changes nothing and works offline.
  
  `mizen doctor` has two new checks. `package.skill` passes when the installed package ships its agent skill and names the file. `setup.stylex` is unverified when the app imports `@mizen-labs/ui/styles.css` and also declares a StyleX package, because two separately compiled StyleX stylesheets do not agree on rule priority. With `--strict`, that finding now exits 1.
- d7737d0: `mizen init` now installs the published `@mizen-labs/ui` release when the app has none. The plan adds the version matching the CLI, pinned exactly, and checks React against peer ranges bundled with the CLI. Init stops when the app resolves another UI version, or declares the package without installing it. `--package` still installs a local archive. No migration is required.

### Patch Changes

- a8fac9d: Remove the remaining unpublished-package wording from init help and conflicts. Correct the README: errors print on stderr with or without `--json`, and dependency installation has a ten-minute timeout. The JSON schema is unchanged.

## 0.1.1

### Patch Changes

- Document installation from npm and one-off CLI execution with npx. Replace obsolete unpublished-package warnings with commands for installing matching UI and CLI versions before running init. Retain archive installation as a local development option.
