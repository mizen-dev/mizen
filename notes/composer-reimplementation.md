# Composer implementation review

## Boundary and baseline

Commit 75b674e introduced the structured draft contract, document operations,
query and clipboard codecs, editor hook, suggestion coordinator, mount effect,
public wrappers, scroll wrapper, styles, examples, exports, and tests.
Later changes added the current approved appearance and integrations.
Initial working tree was clean on main.

Baseline: pnpm lint, pnpm -r typecheck, npx biome check . passed.
Composer document/browser suite: 20 passed against http://localhost:3000.
The first sandboxed Vitest attempt failed to bind localhost (EPERM); rerunning
with local browser access passed. No baseline product failures were observed.

## Compatibility checklist

- Preserve root and /composer exports, public types, defaults and render props.
- Preserve input/selection/history/reset reasons and synchronous edit callbacks.
- Reconcile accepted, rejected and externally replaced controlled values.
- Keep native textarea and structured contenteditable modes.
- Preserve token metadata, canonical text, custom rendering and action callbacks.
- Preserve Unicode query boundaries, filtering, freshness keys and dismissal.
- Preserve directional selection, atomic tokens, multiline and IME behavior.
- Preserve grouped undo/redo, structured clipboard validation and plain-text drop.
- Preserve submit policies, disabled/read-only/working states and native forms.
- Bind reset, selection and beforeinput subscriptions to mounted elements.
- Preserve pickers, attachments, dictation, layout, motion, SSR and hydration.

Consumers include Composer examples and internal fixtures, Message Scroller,
Conversation, package public-type fixtures, and root/subpath package exports.
The existing browser suite covers light/dark themes, narrow layout, tokens,
clipboard, reset, state variants, simulated IME, pickers and dictation.

## Architecture

Pure draft/query/clipboard operations define the data boundary. An editor
session owns element bindings, transient selection/composition and undo history.
React supplies committed options and reads session notifications. Parent values
remain authoritative; the DOM is the browser's working buffer, not a second
React document state. Ref cleanup disposes element listeners.

Trade-off: rich editing uses explicit history to combine native input and token
transactions. Textarea mode retains native history. Approved presentation and
public contracts remain stable. This is independent implementation work, not a
formal clean-room process.

## Provenance

The original commit included an MIT notice for adapted implementation. Commit
045c0b1 removed it before this task. Retained wrappers/styles must not be assumed
independent merely because the editing implementation is replaced. Keep a
scoped notice for retained material until its provenance is resolved; this is
separate from product-facing visual-reference acknowledgments.

## Delivered implementation

- Replaced document traversal with a canonical DOM projection used for text and
  directional selection. Query ranges span adjacent native text nodes without
  normalizing or modifying React-owned token contents.
- Replaced query scanning and clipboard decoding. Preserved Unicode boundaries,
  metadata whitelisting, payload limits, and async query freshness contracts.
- Replaced the editor hook with an element-bound session and a React external
  store adapter. Input listeners have stable ref lifetimes; root commits provide
  current owner options. There is no effect hook or mount-effect wrapper.
- Added transaction history with selection-aware typing/deletion groups, redo
  truncation, and a bounded history. Native textarea history stays native.
- Replaced suggestion keyboard/registration coordination and adaptive-layout
  measurement. Base UI still owns popup positioning and primitive composition.
- Retained public type declarations, entry points, defaults, presentation slots,
  StyleX/CSS, declarative wrappers, and existing integrations. No runtime
  dependency was added. No public contract or supported input mode was reduced.

Reset coverage found two ordering cases: cancellation must be observed after
React handlers, and trusted textarea reset clicks can run their native default
operation after a microtask. Root-bound reset handling now honors cancellation
and aligns the textarea default with the accepted owner value. The reset
callback remains in a microtask. Input remounts do not recreate editor state.

## Verification

Final checks passed:

- `pnpm lint` (includes maximum cyclomatic complexity 10).
- `pnpm -r typecheck` (includes public package consumer types).
- `npx biome check .`.
- `pnpm build`: UI, CLI, and production docs build, including static rendering.
- Composer document, DOM-session, React lifecycle and browser tests, plus
  Conversation/Message contracts, docs discovery and consumer guidance:
  61 tests across eight files. Composer browser coverage comprises 22 Chromium
  tests against `MIZEN_DOCS_TEST_URL=http://localhost:3000`.
- Copied example source/type/lint checks, Conversation and Suggestion browser
  integrations, and Suggestion/Attachment contracts: 14 further tests passed.
  Published examples remained in sync; regeneration was not needed.
- Package-distribution test and packed TanStack Start production consumer.

The packed Next production consumer builds and reaches its archive-size
assertion after its interaction and JS/CSS budget checks. It fails the existing
680,000-byte archive budget: the final archive is 774,347 bytes. An isolated
build of initial commit 61d3250 produces a 773,451-byte archive, proving the
budget failure predates this rewrite. The assertion remains unchanged. The
rewrite does not resolve this repository-wide release-budget issue.

The first production build stalled under the sandbox. Only that production
build process was terminated; a permitted retry passed. The port-3000 server
was never stopped by this task. The user restored it after concurrent dependency
work made it unresponsive. Failed browser runs during that outage are not
counted as verification of the rewrite.

## Limits and retained provenance

IME tests dispatch composition events; they do not drive a real OS input method.
The initial browser pass used Chromium; the second verification below adds
WebKit. Existing light/dark and
narrow-layout assertions pass; this is not a pixel-by-pixel visual comparison.

The declarative wrappers in composer.tsx and composer-scroll-area.tsx, and the
retained CSS/StyleX presentation, still have uncertain provenance from the
introduced boundary. COSS_LICENSE.md restores the original MIT notice for that
retained material. The new editing, suggestion, and layout implementation is
not described as adapted by that notice. Product documentation receives no
library comparisons or visual-reference acknowledgments in this change.


## Second verification — 2026-11-07

A fresh review found an uncovered input-lifetime defect: replacing the editable
node during IME composition could leave the session composing forever. The
session now ties composition to the element that started it. A replacement
cancels the abandoned composition and receives the authoritative parent value.
Rebinding the same element does not cancel its active composition.

Added failing DOM-session and browser regressions before applying the fix.
Added native-textarea undo/redo and rich-edit redo-branch checks. Native undo
uses a single deterministic edit and compares with an ordinary textarea:
word grouping varies between engines and timing, and is not a Composer policy.
The test still asserts exact undo/redo values and parent synchronization.

Reverification passed:

- All 52 public Composer exports have the same names as the initial compiled
  package. Their types pass bidirectional TypeScript assignability checks.
- Composer CSS, StyleX declarations and scroll wrapper match initial commit
  61d3250 exactly. No visual tokens or public props changed.
- `pnpm lint`, `pnpm -r typecheck`, `npx biome check .`, and `pnpm build`.
- 79 Composer and related consumer/source tests across 13 files.
- All 25 Composer browser tests in Chromium and all 25 in WebKit, using
  `MIZEN_DOCS_TEST_URL=http://localhost:3000`.

Firefox was attempted twice, including a retry with `/private/tmp` for its
profile. The installed browser failed to launch with “Could not find profile
folder.” No Firefox behavior is claimed as tested. Composition events remain
simulated; a real OS input method was not exercised. Retained presentation
provenance and the scoped notice remain unchanged.

The final package-distribution and TanStack Start consumer checks pass again.
The Next production consumer again reaches only the existing archive-budget
failure: 774,461 bytes against 680,000 bytes. The isolated pre-rewrite package
remains the 773,451-byte baseline. No budget or assertion was weakened.
The development server was left running; nothing was pushed.

## Presentation replacement plan — 2026-11-07

Scope: the wrappers in composer.tsx, composer-scroll-area.tsx, composer.styles.ts,
and composer.css introduced by 75b674e. Later Mizen attachment, picker, dictation,
context and working-light styles are outside that introduced boundary.

Baseline: 53 focused document, session, React and Chromium tests pass. Captured
12 before-renderings plus computed styles at 390px and 1280px in both themes
under /tmp/mizen-presentation-before. The public contract remains the 52-export
compiled baseline used above.

Checklist: preserve system-owned slots, render/ref forwarding, handler merge
order and cancellation, hidden form value, native textarea props, rich token
portals, suggestion roles and focus, popup defaults, disabled send, stop focus,
adaptive row changes, scroll limits, responsive wrapping, reduced motion,
server rendering and hydration. Keep the scoped license through verification.

Architecture: shared presentation recipes compose Mizen surface, typography and
layout styles. A div-slot adapter handles the common Base UI render contract.
Editor state stays in the existing controller. Adaptive geometry uses inherited
layout variables instead of overriding compiled styles with !important.
The trade-off is a small internal CSS-variable contract for layout; it removes
specificity overrides without adding React state or subscriptions. Native Base UI
scrolling stays responsible for scrollbars. Public types and approved visual
values are requirements, not reasons to retain the adapted implementation.

## Presentation replacement completed — 2026-11-07

This section supersedes the retained-presentation limitation above.

Independently replaced the public part implementations, input/list/status render
adapter, submit/stop presentation, token views, popup composition, scroll-region
adapter, StyleX recipes and adaptive CSS geometry. The editor controller remains
the owner of document state and element lifetimes. Shared recipes now compose
surface, motion and text rules. The internal scroll component accepts only a
region and children; it owns the appropriate classes and system slots. Adaptive
layout uses scoped geometry variables and StyleX state selectors, without
!important overrides. No effects, runtime dependencies or complexity suppressions
were introduced. ESLint still enforces a maximum complexity of 10.

The API declarations, approved visual values and required Base UI composition
remain compatibility requirements. No known adapted presentation logic remains
in the reviewed boundary. Later Mizen integrations and working-light styles were
not part of 75b674e and remain unchanged. This is an independent reimplementation,
not a claim of a formal clean-room process or a legal provenance certification.
The retained public declarations have not been independently reauthored.

COSS_LICENSE.md now describes the completed replacement. Its original copyright
and complete license text match 75b674e exactly. The notice remains conservatively
for retained contract material; this task makes no notice-removal determination.
The built notice matches the source. Product documentation was not changed.

Verification:

- 82 Composer and affected consumer/source tests pass across 14 files, including
  the 511-example source checks. Public examples did not change; regeneration
  was not required.
- Added SSR contracts for form semantics, disabled state, token content and
  system-owned slots. Added browser coverage for custom render state, custom
  token portals, canceled keyboard/button submission, focus and balanced ref
  cleanup across unmount/remount. The fixture starts hidden to isolate existing
  tests. Ref assertions count live bindings, accounting for Strict Mode replay.
- The final closed scroll-region implementation passes the 26 Composer browser
  tests in Chromium and in WebKit, plus both new SSR tests. Every browser run
  used MIZEN_DOCS_TEST_URL=http://localhost:3000.
- All 12 before/after PNG captures are byte-identical: plain, mentions and
  adaptive examples, light/dark themes, 390px/1280px widths. Sampled computed
  styles and element sizes also match exactly. Captures are under
  /tmp/mizen-presentation-before and /tmp/mizen-presentation-final. These are
  resting-state comparisons, not exhaustive animation or interactive-state
  pixel coverage. Existing browser tests also exercise filled and working states.
- All 52 public export names and bidirectional TypeScript signatures match the
  pre-rewrite compiled baseline.
- pnpm lint, pnpm -r typecheck, npx biome check ., and pnpm build pass.
  Production builds cover UI, CLI and docs. The UI was rebuilt after the
  notice-only scope update.
- Final package-distribution and TanStack Start production-consumer checks pass.
  The Next production consumer builds and passes behavior and JS/CSS budgets,
  then fails only the existing archive budget: 775,684 bytes versus 680,000.
  The original pre-rewrite archive was already 773,451 bytes. Assertions and
  budgets were not weakened.

An intermediate combined run passed all 79 behavior tests but failed its
conversation-browser console check with a docs-shell hydration mismatch during
active development. The focused rerun (33 tests) and subsequent full run (82
tests) passed, including that console check. No unrelated shell code was changed.

Firefox was not retried; the prior environment launch failure remains a coverage
limit. IME coverage still uses simulated composition events, not an OS input
method. The existing port-3000 server was never stopped. Nothing was pushed.

## Focused provenance review — follow-up

The line-by-line introduction review found a missed retained implementation:
focusComposerInput still used the introduced closest-element algorithm. The
inline hidden live-region markup and public-context projection also retained
substantial identical blocks. The previous completion statement was too broad.
These are being replaced before deciding whether to remove the scoped notice.

Replacement requirements: frame-background presses focus the first draft;
interactive descendants retain their own behavior; canceled events and disabled
drafts do not steal focus; only the mousedown phase prevents the native default.
The new hit policy walks ancestors within the frame. The announcement will reuse
Mizen's existing visually-hidden StyleX recipe, retaining its text, role and
render timing. Public metadata types will share one schema for suggestion and
inserted-token fields, preserving optionality, readonly arrays and interface
augmentation. These changes add no effects, dependencies or visual redesign.

### Review findings and resolution

Reviewed the entire 75b674e file boundary, including moved declarations and
supporting examples, and compared surviving Composer functions across files.
The comparison used normalized line blocks plus parsed function bodies; matching
text was inspected rather than treated as an automatic copyright verdict.

- Document, query, clipboard, history, session and subscription logic use the
  replacements recorded above. The old mount-effect helper is absent.
- Frame focus forwarding was a retained algorithm, not just an API signature.
  Replaced closest-element lookup with a frame-bounded ancestor ownership walk.
  React portal bubbling remains supported, even when its target is outside the
  frame DOM. Added direct regression coverage for that behavior.
- Replaced the inline live-region style object with Mizen's existing
  visuallyHiddenStyles. That module exists in the parent of 75b674e. The live
  region retains its role, atomic announcement, message and render timing.
- Replaced the retained context destructuring block with an explicit public
  projection. Rebuilt token/suggestion declarations around shared insertion
  metadata. Public interfaces remain interfaces; union fields, callback types,
  optionality and readonly arrays retain their contracts.
- Reviewed surviving style matches: they specify Mizen tokens, approved visual
  values and browser properties within the new recipes. They are not surviving
  editor algorithms. Reordering those declarations would not improve provenance.
- Other surviving matches are imports/exports, contract property names and types,
  standard DOM/React operations, the required announcement text, and conventional
  cancellation/IME guards. The function comparison found only the one-line
  announcement formatter and the four-condition IME/cancellation predicate as
  identical bodies longer than 80 source characters. Both express retained
  behavior through ordinary operations; no distinctive adapted implementation
  remained in that review. Shorter bodies were reviewed as API accessors and
  standard DOM predicates, not hidden by the comparison threshold.
- The introduction's compatibility styles and docs examples were Mizen token
  bindings and consumers of the public Composer API. The obsolete prompt-composer
  implementation is no longer present. No implementation copy was identified
  in the retained consumers. Product docs and visual acknowledgments are unchanged.

The earlier assumption that matching public declarations alone justified keeping
a third-party implementation notice was too broad. After the replacements above,
the focused review identifies no remaining copied implementation or distinctive
source material covered by the component-specific notice. The notice can now be
removed from current source and rebuilt distribution. Git history continues to
preserve the notice for earlier revisions; dependency licenses are unaffected.
This is a scoped source review, not a formal clean-room certification.

### Notice removal and final verification

Removed packages/ui/src/components/composer/COSS_LICENSE.md only after the
residual replacements and review. This supersedes earlier instructions in this
record to retain that notice. Rebuilt dist from scratch and inspected the actual
/tmp/mizen-provenance-reviewed.tgz archive: neither source nor distribution
contains the removed notice. Both Composer entry points and package/LICENSE
remain present. No dependency license or unrelated notice was removed.

Final checks:

- 100 tests pass across the 14 Composer and affected consumer/source suites.
  This includes 20 presentation tests covering frame press ownership,
  cancellation, disabled/read-only inputs, negative tabindex, root presses,
  React portal bubbling, SSR and token semantics.
- All 26 browser tests pass in Chromium and WebKit. Added browser assertions
  check frame-background focus and the exact live suggestion announcement.
  Every browser run uses MIZEN_DOCS_TEST_URL=http://localhost:3000.
- All 12 approved PNGs and the sampled computed layout/style captures match
  /tmp/mizen-presentation-before exactly. The new capture directory is
  /tmp/mizen-presentation-provenance.
- All 52 public exports pass name and bidirectional type checks against the
  original compiled API. pnpm -r typecheck includes public-type consumer tests.
- pnpm lint, pnpm -r typecheck, npx biome check ., and pnpm build pass.
  Complexity remains limited to 10, with no effect hooks or new dependencies.
- Package distribution and the TanStack Start production consumer pass.
  The Next production consumer passes interaction and JS/CSS checks and fails
  only the existing archive-size assertion: 774,870 bytes versus 680,000.
  The pre-rewrite archive was already 773,451 bytes. No assertion was weakened.
- Public examples did not change; the 511-example source checks pass without
  regeneration. No product-facing acknowledgments or library comparisons added.

The first new WebKit frame-click assertion targeted the rounded corner outside
its hit area and timed out. Moving the test point onto the frame's top edge
resolved the test without changing focus assertions. A sandboxed unit-test
attempt failed before running tests because Vitest could not bind a local
listener; the permitted retry passed. These are not counted as passing runs.

Existing coverage limits remain: Firefox could not launch in the earlier
verification environment, and IME is exercised using composition events rather
than a real OS input method. Resting-state PNG matches do not claim exhaustive
animation or screen-reader testing. The existing port-3000 server was not stopped.

## Package budget resolved

The later packaging correction passes the existing archive budget at 675,955
bytes, without changing Composer or other component source. Both packed Next and
TanStack Start consumers pass. See [package-size-verification.md](package-size-verification.md)
for the build changes, compatibility evidence and final measurements.
