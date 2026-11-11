---
"@mizen-labs/ui": patch
---

`Timestamp` takes the size and line height of the text around it. It set 16px itself and accepts no style props, so a time in a 14px row, table cell, or `Text size="ui"` stayed 16px. Put a standalone `Timestamp` inside `Text` to give it a size.
