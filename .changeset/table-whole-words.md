---
"@mizen-labs/ui": patch
---

`Table` and `DataTable` keep words whole inside a container that sets `overflow-wrap: anywhere`, such as `AccordionContent`, `PreviewCard`, or an app's own wrapper. The table inherited that rule, so its columns shrank below a word and "Department" broke in two. A word now breaks only when it cannot fit its column.
