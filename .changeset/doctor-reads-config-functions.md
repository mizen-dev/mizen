---
"@mizen-labs/cli": patch
---

`mizen doctor` verifies more setups without running them. Bundling passes for a Vite or Next config function that ends with one `return` of an object literal. The Start theme passes when the one `createRouter` call renders `{children}` inside `ThemeProvider` in `Wrap` or `InnerWrap`. Doctor is also stricter: `ThemeScript` and `ThemeProvider` under a condition or inside an attribute no longer pass, and a Vite config that sets `ssr.external` stays unverified unless the list is literal and omits Mizen. A workspace root that is also an app now points to `--workspace`. Unverified bundling and theme diagnostics name what doctor reads and the evidence to check by hand.
