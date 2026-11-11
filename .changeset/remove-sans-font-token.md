---
"@mizen-labs/ui": minor
---

Removed `fonts.sans` from `@mizen-labs/ui/fonts.stylex`. No component read it: components inherit the interface font from `body`. Set your font family on `body`. `fonts.mono` and `fonts.sizeAdjust` stay, as `--mizen-font-mono` and `--mizen-font-size-adjust` in the published stylesheet.
