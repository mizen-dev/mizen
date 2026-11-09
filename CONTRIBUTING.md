# Contributing to Mizen

Report library findings through this repository's GitHub Issues. Use Bug,
Improvement, or Missing component. No separate project board is required.

## Integration workflow

App reproduction → Mizen issue → fix PR → release → app verification

1. Record the installed Mizen version and check the documented API.
2. Reproduce the problem with the smallest supported composition.
3. Decide whether the app or Mizen owns the defect. Record uncertainty.
4. Search existing issues by component, behavior, and operator task. Reuse a
   matching issue. Otherwise use the appropriate report form.
5. Add the regression test in the owning repository. A library fix PR must link
   the report, minimal reproduction, test, and verification results.
6. Merge the library fix with its regression test. Record the release version
   and release link on the report when published.
7. Upgrade the original app. Repeat the original workflow and record the
   installed version, app commit, browser, result, and evidence on the issue.
   Only then mark consumer verification complete.

Do not patch library internals or hide defects with CSS overrides.
Do not close a report merely because its PR merged.
Use `Refs #123` in a fix PR until consumer verification is complete.

## Triage and labels

The forms apply `component:needs-triage`, `severity:needs-triage`, and
`status:triage`, plus the report type. Form answers do not automatically change
labels. Maintainers confirm them during triage:

- Component: replace the placeholder with `component:<slug>`, such as
  `component:dialog`. Add more than one when needed. Create labels as actual
  reports need them; do not maintain a duplicate component catalog.
- Severity: critical means data loss or an unsafe operation; high means a
  current workflow is blocked; medium means degraded work with a supported
  workaround; low means minor friction or a future idea.
- Status: `status:triage` → `status:accepted` → `status:in-progress` →
  `status:awaiting-consumer` → `status:verified`. Keep one status label.
  Awaiting consumer means the fix is released but the original app has not
  verified it. Record a disposition before closing duplicates or app-owned reports.

The Issue labels workflow creates the standard labels from
`.github/issue-labels.json` when that file or workflow reaches `main`. It also
supports manual dispatch. It preserves existing labels and never deletes them.
Run it successfully before relying on automatic issue-form labels.

## Missing component triage

Prioritize missing components that block an actual workflow.

| Finding | Action |
| --- | --- |
| Existing composition works | Document the recipe. |
| Existing component lacks one capability | Extend its API. |
| Reusable interaction is absent | Propose a new component with states and keyboard behavior. |
| Behavior belongs to the admin domain | Keep it in the app. |

A user balance editor belongs in the app. A reusable control that it needs may
belong in Mizen. Do not grow the library from speculative inventory lists.

## First workflow: Users edit

Test one workflow at a time in the consumer app. Record app commit, installed
Mizen version, browser, and test data. Use a test account and synthetic user data.
This checklist is a test plan, not evidence that the workflow has passed.

| Exercise | Expected result |
| --- | --- |
| Open, Tab, Shift+Tab, arrows where supported | Focus order follows the task; controls work without a pointer. |
| Submit empty or invalid values | Errors identify fields and explain corrections; entered values remain. |
| Fail a save, then retry | Failure is visible; edits remain; retry can succeed. |
| Submit repeatedly during a pending save | One operation runs; pending state prevents duplicate changes. |
| Cancel, Escape, outside click where supported | Dismissal follows the documented contract and the app's unsaved-edit policy; focus returns to the opener. |
| Long Russian names, labels, validation messages, and unbroken text | Text remains readable; wrapping does not hide actions or break navigation. |
| Save successfully, reopen, then edit again | Saved values appear; no stale errors or pending state remain. |

Record each observed problem with steps, expected and actual results, operator
impact, evidence, and likely ownership. File separate issues for independent
causes. Link related reports to the workflow instead of creating an inventory.

## Temporary reports without tracker access

In the consumer app, save `docs/ui-findings/<short-description>.md`. Use the
matching issue form's fields and include the installed version, ownership
assessment, and existing-issue search. For blocked steps, say what is missing;
do not invent results.

Once filed, replace the report body with its canonical issue link. Keep updates
on the issue. Do not maintain two backlogs or copy app findings into this repo.

## Package releases

Record user-visible package changes with `pnpm changeset`. Prepare a release PR
with `pnpm version-packages`. Publishing requires a manual Release workflow run.
Follow [the release guide](RELEASING.md) for CI artifacts, npm setup, tags, and retries.
