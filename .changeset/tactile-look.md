---
"@mizen-labs/ui": minor
---

Redesign the components with a cleaner, tighter look. Review your screens after you upgrade: sizes, corners, and text sizes change.

- Controls: the default control is 32px high (was 36px), `sm` is 28px, and `xs` is 24px. Corners are tighter: 6px, 8px, and 10px controls, 12px floating surfaces, 16px cards, 20px large surfaces.
- Fields are white with a hairline edge and a small drop, not filled. `shadows.recessedRest` is replaced by `shadows.fieldRest`.
- Focus is the solid brand color. Controls show a 2px ring, 2px off their edge. Fields color their edge and add a soft halo; an invalid field keeps its error color.
- Type: interface text is 14px, labels and supporting text are 13px, and buttons are 14px medium. Card, popover, and legend titles are 14px semibold; dialog, sheet, and drawer titles are 16px semibold. A text button sizes its icon for its text: 16px, or 14px in `sm` and `xs`.
- Tracking is themeable. `letterSpacing` is now a variable group with a new `ui` token for 13–16px text. The defaults are unchanged; override them with `createTheme` to suit your font.
- Spacing: labels, controls, and help text sit 6px apart (`space["1.5"]`). `SelectLabel` and `SliderLabel` now match `FieldLabel`, and `Field` renders `data-slot="field"`. Card sections sit closer together. `CheckboxGroup` and `RadioGroup` no longer force full width, so `<Fieldset render={<RadioGroup />}>` gives one named group.
- Selection is neutral (`colors.selected`). Badges use a dot and a hairline edge. Tables are frameless. The switch has a light track.
- Motion: a switch thumb and a selection indicator move with a spring (`easing.spring`, `duration.spring`). Buttons and toggles press 1px inward (was 2px), and a ghost button fades in at full size. Checkboxes and radios no longer scale on press.
- New tokens: `colors.controlBorder`, `colors.controlIndicator`, `colors.outlineSurface`, `colors.selected`, `colors.infoSolid`, `shape.controlRadiusSmall`, `focusOutline.fieldWidth`, `focusOutline.fieldOffset`, `focusOutline.fieldHalo`, and `conditions.anchored`.

Migration: replace `shadows.recessedRest` with `shadows.fieldRest`. Remove CSS that assumes 36px controls or the old radii. If a choice group must fill its container inside a centered flex parent, set the width on that parent. If you set your own font, check its tracking and override `letterSpacing` where needed.
