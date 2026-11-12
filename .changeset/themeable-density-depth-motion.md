---
"@mizen-labs/ui": minor
---

An application can now replace the `space`, `control-size`, `glyph-size`, `shadow`, `duration` and `easing` tokens. Declare `--mizen-space-4`, `--mizen-control-size-md`, `--mizen-shadow-floating` or `--mizen-duration-fast` again on `:root` and the components follow, as they do for colors and radii. Before, these variables could only be read.

For an app that compiles StyleX itself: `space`, `controlSize`, `glyphSize`, `shadows`, `duration` and `easing` are now `defineVars` groups. Their values are `var(...)` references, so they no longer work inside a media query or in JavaScript arithmetic.
