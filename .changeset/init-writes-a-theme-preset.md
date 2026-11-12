---
"@mizen-labs/cli": minor
---

`mizen init --preset vivid` writes `mizen-theme.css` into the app and imports it after the Mizen stylesheet. The file sets `--mizen-*` token variables and belongs to the app: Vivid fills the primary action with the accent, tints the selection and deepens the status colors. The option also works on an app that is already set up. Init never replaces a theme file that differs from the preset.
