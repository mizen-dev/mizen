---
"@mizen-labs/ui": patch
---

Controls inside a rounded container now share its corner centre: the inner radius equals the outer radius minus the gap, and the gap is the same on every side.

- `Menubar` rounds its root to 15px around its 10px triggers.
- `ToolbarLink` uses the 10px radius of the other toolbar controls.
- `Token` takes its radius from its size (6, 8, 10px). Its remove button keeps a 24px target and sits as far from the end edge as from the top and bottom.
- `InputGroup` places an inline-end button 4px from the end edge, as from the top and bottom.
- `Combobox` puts its chevron and clear glyph where `Select` puts its chevron, and its leading glyph where `InputGroup` puts one. Chips use the 6px radius.
- `DatePicker` and `DateRangePicker` round the calendar button to 6px.
