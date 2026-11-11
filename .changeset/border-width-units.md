---
"@mizen-labs/ui": patch
---

The published stylesheet no longer contains border and outline widths without a unit, such as `border-width: 1`. A browser drops such a value, so borders were 3px wide in an app that loads `styles.css` without a CSS normalizer. `borderWidth.thin` and `borderWidth.focus` from `@mizen-labs/ui/interaction.stylex` are now `"1px"` and `"2px"`. If your styles append `px` to them, remove it.
