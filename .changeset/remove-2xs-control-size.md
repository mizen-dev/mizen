---
"@mizen-labs/ui": minor
---

Removed `controlSize["2xs"]` from `@mizen-labs/ui/dimensions.stylex`. It had the same 24px value as `controlSize.xs`; use `xs`. The published stylesheet has `--mizen-control-size-xs` and no `--mizen-control-size-2xs`.
