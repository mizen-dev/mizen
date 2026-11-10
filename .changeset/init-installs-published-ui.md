---
"@mizen-labs/cli": minor
---

`mizen init` now installs the published `@mizen-labs/ui` release when the app has none. The plan adds the version matching the CLI, pinned exactly, and checks React against peer ranges bundled with the CLI. Init stops when the app resolves another UI version, or declares the package without installing it. `--package` still installs a local archive. No migration is required.
