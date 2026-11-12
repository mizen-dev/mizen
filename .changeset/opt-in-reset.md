---
"@mizen-labs/ui": minor
---

Add `@mizen-labs/ui/reset.css`, an opt-in reset. It sets `box-sizing: border-box` on every element and pseudo-element, removes the `body` margin, and makes form controls inherit `font` and `letter-spacing`. Its rules sit in the `mizen-reset` cascade layer, so any CSS outside a layer wins over them. No component and no other stylesheet imports it, and components render the same with it and without it.
