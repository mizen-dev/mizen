---
"@mizen-labs/cli": minor
---

`mizen info` and `mizen search` now compare their catalog with the `@mizen-labs/ui` your app has installed. When the versions differ, they print a warning on stderr with the command for the installed version, `npx @mizen-labs/cli@<version> …`. When the installed package has no export for the component, `info` fails with the new reason `unavailable` (exit 1) instead of describing an import your app does not have.

Both commands accept `--cwd <DIR>` and add `installedUiVersion` to their JSON data. Text output of `info` has a `Version` row. Discovery now reads one project file, the installed `@mizen-labs/ui` manifest; it still changes nothing and works offline.

`mizen doctor` has two new checks. `package.skill` passes when the installed package ships its agent skill and names the file. `setup.stylex` is unverified when the app imports `@mizen-labs/ui/styles.css` and also declares a StyleX package, because two separately compiled StyleX stylesheets do not agree on rule priority. With `--strict`, that finding now exits 1.
