---
"@mizen-labs/ui": patch
---

A default `PopoverPopup` wraps its text at 18rem. Base UI sets the popup width to `auto`, so the 18rem fallback never applied and a text-only popup grew to one long line. A popup is now as wide as its content, up to 18rem. It still grows for content that cannot shrink, such as a calendar, and narrows when the window leaves less room. A popup with `portalProps={{ keepMounted: true }}` follows the same rule; it was always 18rem before.
