---
name: mizen-ui
description: Build React interfaces with an existing Mizen UI installation. Use published components and workflow recipes without inventing imports, styling props, or runtime behavior.
---

# Build with Mizen UI

Use the application's configured Mizen docs origin. Resolve the paths below
against that origin. Mizen is currently a private workspace package, not a public
npm release. If the host app is not configured, read `/docs/installation/markdown`
before changing its compiler, fonts, or theme setup.

## Find the existing contract

Start at `/llms.txt`. Read the relevant component Markdown and focused example
before writing code. Prefer a small focused example for a small task; do not
copy a whole demo to render one control.

Reviewed component contracts are available at
`/docs/components/<slug>/metadata`. Anatomy, imports, dependencies, client
boundaries, and state ownership are present only where reviewed. Missing contract
metadata means consult the component's Markdown and exported TypeScript types;
do not infer unsupported props from another UI library.

Preserve the state-specific props and integration requirements in each component's
reviewed metadata. Consult `/docs/components/approval-card/metadata` for approval
callbacks and `/docs/components/data-table/metadata` for table features. Retain
those requirements when simplifying a copied example.

## Compose the interface

- Import only documented exports from `@mizen/ui` or its documented subpaths.
  Compound parts are named exports, not guessed namespace properties.
- Styling contracts are closed. Do not pass `className`, `style`, `sx`, or
  `xstyle` to components that omit them. Use their semantic props and existing
  Stack, Inline, Grid, and other layout components. Style application-owned host
  elements with StyleX and the existing tokens when necessary.
- Keep the white canvas, neutral workareas, recessed fields, neutral ink,
  wine actions, and lavender selection. Typography and spacing provide hierarchy;
  avoid adding a card around every group. Read `/docs/foundations/markdown` and
  `/docs/composition/markdown` when composing a larger view.
- Add `"use client"` to the consumer component that uses hooks, browser APIs,
  or event handlers. A library Client Component can appear in a Server Component;
  that alone does not make its parent a Client Component. Keep render callbacks
  inside client boundaries. Read `/docs/integrations/markdown` for TanStack setup.
- Keep data, validation, persistence, and operation outcomes in the application.
  Derive filtered results from current inputs. Use event handlers for actions.
  Do not add an effect to synchronize derived state.
- Give fields visible labels, associate descriptions and errors, name icon
  actions, and use native form submission. Keep loading and errors explicit.
  Approval Card reports a caller-owned decision; the application authorizes and
  executes the operation.

## Verify the result

Run the host's TypeScript and lint checks. Exercise the task with keyboard input,
including validation, empty results, dismissal, and focus return where relevant.
Check light/dark and narrow layouts. Describe local demo outcomes truthfully.
Use real persistence or runtime adapters only when the task requests them.

If a needed capability is missing, report the gap. Do not disguise a new API or
backend behavior as an existing Mizen feature.
