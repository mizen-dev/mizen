---
"@mizen-labs/ui": patch
---

A `Button` rendered by `MenuTrigger`, `PopoverTrigger`, or another trigger keeps its icon size and loading state. The button now carries a `data-button` attribute, and its own CSS no longer depends on `data-slot`, which a trigger replaces.
