---
"@mizen-labs/ui": minor
---

Every token is now a CSS variable in `@mizen-labs/ui/styles.css`, named `--mizen-<group>-<name>`: `--mizen-color-content`, `--mizen-space-4`, `--mizen-font-size-14`. An app styles its own elements with them in plain CSS and needs no StyleX setup.

The themed groups (`color`, `field-color`, `font`, `shape`, `letter-spacing`) can be changed: declare a variable again on `:root` after the Mizen stylesheet, and add a `[data-theme="dark"]` rule for a separate dark value. Components follow it. The scales (`space`, sizes, type sizes, `shadow`, `palette`, motion) are read-only.

The library's own values sit in the `mizen-tokens` cascade layer, so a plain app rule wins in both themes. An app that compiles StyleX itself must compile the Mizen source in the same StyleX build instead of importing `styles.css`; two separately compiled StyleX stylesheets do not agree on rule priority.
