---
"@mizen-labs/ui": patch
---

A default `PopoverPopup` is 18rem wide again and wraps its text. Base UI sets the popup width to `auto`, so the 18rem fallback never applied and a text-only popup grew to one long line. The popup still grows for content that cannot shrink, such as a calendar, and narrows when the window leaves less room. Short popovers are now 18rem too.
