# @mizen-labs/cli

[CLI documentation](https://ui.mizen-labs.dev/docs/cli/).

The CLI for Mizen. The first commands discover components
from a bundled snapshot of the same metadata and guidance used by the docs.
Discovery works offline without reading the consumer project. Doctor reads local
project metadata and supported setup files. Discovery and doctor do not modify project files. Init previews changes by default;
only an explicit --yes applies them.

## Run in this workspace

```sh
pnpm --filter @mizen-labs/cli build
node packages/cli/dist/cli.js --help
```

Run these commands from the repository root during development:

```sh
node packages/cli/dist/cli.js search approval
node packages/cli/dist/cli.js info button
node packages/cli/dist/cli.js info diagram --json
```

## Install from npm

```sh
npm install --save-dev @mizen-labs/cli
npx --no-install mizen search forms
```

For a one-off command, run `npx @mizen-labs/cli@latest --help`.

Node must satisfy `>=22.18.0 <23 || >=24.11.0`.

## Commands

- `mizen search [query]`: match all query words against names, slugs, categories,
  descriptions, and usage guidance. No query lists every component in slug order.
- `mizen info <component>`: show the documented API, entry point, status, guidance,
  and available contracts or usage examples. Accepts a slug or spaced name.
- `mizen doctor [--cwd <directory>] [--workspace] [--strict]`: inspect a target application.
- `mizen init [--cwd <directory>] [--dry-run] [--yes]`: preview or apply setup.
- `mizen --help` and `mizen --version`: show command help and CLI version.

`--json` emits one JSON document. Results go to stdout. Errors go to stderr, with
or without `--json`, and stdout stays empty. Exit status remains nonzero.

Success envelope:

```json
{"schemaVersion":1,"command":"info","data":{"uiVersion":"0.1.1","component":{}}}
```

The empty component above represents the full registry entry. Search data contains
`query`, `uiVersion`, and `components`. Info data contains `uiVersion` and
`component`. Component records always include the documented subpath and docs
route. API sections, contracts, and examples are present only when documented.
The catalog is bundled at CLI build time; it does not inspect your installed UI.

Results print on stdout. With `--json`, an error prints one line on stderr and
stdout stays empty:

```json
{"schemaVersion":1,"error":{"reason":"not_found","message":"Couldn't find component buton. Did you mean button?","data":{"suggestion":"button"},"next":[{"argv":["mizen","info","button"],"command":"mizen info button"}]}}
```

`reason` is stable; `message` is the human headline, so never parse it. `next`
lists commands that move forward, and `data` holds structured detail such as a
suggestion or the doctor diagnostic behind an init conflict.

| Exit | Meaning | Reasons |
| --- | --- | --- |
| 0 | Success, including an empty search, a plan, and no changes needed | — |
| 1 | A failure: not found, a conflict, a failed check or install, or a bug | `not_found`, `project_not_found`, `conflict`, `recovery_required`, `internal_error`; doctor and init reports |
| 2 | Invalid usage or missing input | `unknown_command`, `unknown_option`, `invalid_arguments`, `missing_name` |

Use fields and reasons for automation; human wording may change. Schema version
1 is a pre-release contract. Breaking changes require a new schema version.

## Verify

```sh
pnpm --filter @mizen-labs/cli test
pnpm --filter @mizen-labs/cli lint
pnpm --filter @mizen-labs/cli typecheck
```

Tests install the packed archive in a temporary app. They verify catalog parity,
failure codes, project preservation, and independent execution. Installation may
need network access for declared dependencies; the installed commands work offline.

```sh
MIZEN_PACKED_CONSUMER=1 pnpm --filter @mizen-labs/cli test
```

The opt-in checkpoint installs the packed UI into the Next.js and TanStack Start
fixtures, then runs strict doctor checks. The separate production/browser checkpoint
also covers plain React + Vite in JSX and TSX.


## Doctor

```sh
node packages/cli/dist/cli.js doctor --cwd apps/my-app
node packages/cli/dist/cli.js doctor --cwd apps/my-app --strict --json
```

Doctor finds the nearest app manifest. Without `--workspace`, workspace roots require
an explicit app path. It reports the installed framework version, Node and React peer compatibility,
React/ReactDOM version agreement, module identity, package-manager lockfiles and
packageManager declarations, and supported setup declarations.

Configuration and source are parsed, never imported or executed. The first syntax
checks cover Next App Router roots, TanStack Start roots, and React/Vite client entries. They inspect literal configuration,
simple unmodified configuration bindings, and Vite defineConfig object arguments.
Custom wrappers, computed settings, indirect stylesheet pipelines, and delegated
providers can remain unverified. A passing syntax check describes a declaration;
it does not prove runtime delivery, hydration, or first-paint behavior.

The report contains `project`, `status`, `summary`, and ordered `diagnostics`.
Each diagnostic has a stable `id`, `status` (`pass`, `error`, or `unverified`),
`message`, evidence paths, and repair guidance when needed. Reports can also include
`framework` and `uiVersion` after target discovery.

Report status is `healthy`, `incomplete`, or `failed`. Confirmed errors exit 1.
Unverified checks exit 0 by default; `--strict` makes them exit 1. Doctor still emits
a complete report with `command: "doctor"`, rather than an error envelope. Unsupported
or custom setups receive explicit limitations and manual review steps.

### Workspace reports

```sh
mizen doctor --workspace --cwd .
mizen doctor --workspace --cwd . --strict --json
```

Workspace discovery starts at `--cwd` and finds the nearest ancestor declaration.
It supports npm `workspaces` arrays or package lists and `pnpm-workspace.yaml`.
The pnpm declaration takes precedence. Conflicting declarations remain unverified.
The root package is included. An omitted pnpm package list selects only the root.

Each supported Next.js, TanStack Start, or React/Vite app gets its own report.
Libraries are listed with skip reasons. Malformed manifests do not stop other apps.
Unsupported or ambiguous apps, linked directories, and patterns outside the root
remain unverified. Discovery reads files without invoking managers or repository hooks.
Inspect external or linked apps explicitly with `--cwd` without `--workspace`.

Workspace JSON adds `workspace`, `apps`, and `skipped` to the doctor payload.
The flat diagnostics include each app's `project`; summary counts cover that flat list.
No detected apps produces an incomplete report. Existing exit codes and `--strict`
behavior apply. `init` still requires one explicit application target.


Doctor and init load their syntax and HTML parsers only when requested. Discovery keeps
its existing startup path. This adds runtime dependencies to support accurate
checks; the CLI no longer has a zero-dependency claim.


## Init

Init configures an existing Next.js App Router, TanStack Start, or plain React + Vite application.
Install the framework and matching React/ReactDOM versions first. It does not
create an application, select a font, or replace existing document defaults.

Install the CLI in the app, then preview setup:

```sh
cd /path/to/app
npm install --save-dev @mizen-labs/cli@0.1.1
npx --no-install mizen init --dry-run
npx --no-install mizen init --yes
```

An app without `@mizen-labs/ui` gets the published version matching the CLI catalog,
pinned exactly. The catalog records that version's peer ranges, so planning needs no
network request. An installed and declared package at that version needs no install.
Init stops when the app resolves another version, declares the package without
installing it, or resolves it without declaring it. Align the versions or the
declaration, then rerun init.

`--package` installs a local archive instead of the published version.
Archives must contain `@mizen-labs/ui` at the catalog version. Init inspects the archive
without extracting it and records its SHA-256 for a check before application.
The current reader bounds archive size at 50 MB and manifest size at 1 MB.

The default command returns a plan without applying it. `--dry-run` also prevents
application when combined with `--yes`. Nothing prompts in unattended runs.
`--json` emits one versioned document, including the exact source changes, unified
diffs, and the dependency command. `--yes` accepts that generated plan; it cannot
bypass a conflict. Source previews can contain local application code.

Supported dependency writes use npm or pnpm. Lockfiles and packageManager declarations
must agree. With no lockfile or declaration, pass `--package-manager npm` or
`--package-manager pnpm`. Yarn and Bun remain diagnostic-only until their write paths
have equivalent evidence. Dependency installation skips lifecycle scripts and retains
development tools even under NODE_ENV=production. Package-manager resolution can
change package.json, lockfiles, and node_modules; their exact resulting diffs cannot
be known before installation. Source diffs are determined in advance.

Add `--feature diagram` to install the optional Pele peer. Other optional
integrations are not installed speculatively. Existing incompatible peers require
manual resolution; init does not replace React or choose an upgrade policy.

Init uses syntax ranges to add stylesheet imports, default theme bootstrap, hydration
warning handling, and the required bundling entry. Existing comments, directives,
provider aliases, metadata, fonts, and unrelated settings remain intact. The first
write path supports literal configuration and conventional root functions. Wrapped
exports, namespace theme composition, shadowed theme imports, computed head links,
and conflicting theme placement require manual setup. The command stops before
installing dependencies when those source conflicts are detected.

After installation, doctor checks dependencies. Source files are staged before
ordered atomic replacements. Contents are checked again before each replacement.
A second successful init is a no-op and still runs doctor. Init does not lock external
editors or provide an atomic transaction across a package manager and several files.

Application creates `.mizen-init-journal.json` with POSIX mode `0600`. Windows uses
the directory's inherited ACL; this mode does not provide owner-only Windows access. It records
original and proposed source text for recovery and is removed after success or a
handled installation failure. If installation fails, source files stay unchanged;
dependency changes may remain. If post-edit verification fails, source edits roll
back when their contents still match. Rollback refuses to discard detected caller
changes. An unexpected interruption retains the journal and blocks another init.
Review its before/after records, restore or finish the recorded source edits, repair
dependency installation as needed, then remove the journal and rerun doctor.

Init JSON data contains `status`, `plan`, `verification`, and `message`. Status is
`planned`, `unchanged`, `applied`, `install-failed`, or `verification-failed`. Plans
include the project, framework, source edits, optional install command, original
manifest text, optional read-only inputs, and UI version. Conflicts use the standard error envelope. Failed
install/verification reports exit 1 and describe retained dependency changes.


### Plain React + Vite

The same init command supports the default create-vite React JSX and TSX templates.
It reads index.html, checks its active module entry, then adds the compiled CSS
import, synchronous initializeTheme call, and ThemeProvider to src/main.jsx or src/main.tsx. Existing StrictMode,
application providers, CSS imports, and comments stay intact. A provider already
covering the mounted tree is reused.

Run from the app after installing the CLI as shown above.

```sh
npx --no-install mizen init --dry-run
npx --no-install mizen init --yes
npx --no-install mizen doctor --strict
```

initializeTheme from @mizen-labs/ui/theme/initialize applies the initial theme before
React mounts. It shares root-theme behavior with ThemeProvider; subsequent changes
belong to the provider. Custom initialization options (storage, storageKey, defaultTheme)
must match provider options. Init stops for manual review when existing custom props
have no explicit bootstrap. A stale UI archive without the initializer is rejected;
install a matching published UI version, or rebuild the archive when testing local changes.

This client-only path adds no SSR ThemeScript or ssr.noExternal setting.
Vite configuration and index.html source stay unchanged. The plan records
index.html as a read-only input and checks it again before writing source files.
Plain Vite needs no framework-specific Mizen configuration.

The first path recognizes a single index.html module entry at src/main.jsx,
src/main.tsx, src/main.js, or src/main.ts using top-level
createRoot(...).render(<App />), including imported aliases and ReactDOM namespaces.
Custom roots, multiple entry modules, non-JSX rendering, and partial provider
coverage require manual review. HTML comments and template contents do not count
as active entries. React SSR frameworks retain their own detection and setup paths.

Both JSX/npm and TSX/pnpm consumers pass packed-CLI initialization, repeat invocation,
production builds, and Chromium checks for the first app-frame theme, theme switching,
counter interaction, and dialogs. TypeScript consumers also compile strictly.

### Platform and release checks

The CI workflow defines the OS/Node matrix.
`pnpm release:check` at the repository root packs UI and CLI, verifies isolated npm
and pnpm consumers, and saves archives with checksums and consumer lockfiles.
It does not publish.

Package-manager commands use cross-spawn to resolve Windows `.cmd` shims. Init
captures installation output synchronously, within its ten-minute timeout,
so machine-readable commands still emit one JSON document. No progress events are
streamed during installation.

### Command help and recovery

Each command has its own options, examples, and scope:

```sh
mizen search --help
mizen info --help
mizen doctor --help
mizen init --help
mizen init --help --json
```

Help returns before inspecting the app or installing dependencies, including when
`--yes` is present. Help and version reporting do not load the catalog, so they
remain usable if it is missing or damaged. Unknown commands remain usage errors. Options for another
command and missing arguments explain which help page to use. Global `--help`
lists commands and common options. JSON help keeps command `help` and data `usage`;
the usage text now describes the selected command.

Failed init verification prints its diagnostic IDs, evidence paths, and repair
steps. App-target and package-manager conflicts also retain their file evidence
and recovery instructions. The CLI does not apply a repair automatically. Error
codes and process exits remain the automation contract; human wording can change.
Arguments after `--` remain literal, including `--help` and `--json`.

### JSON output schema

The package includes a local Draft-07 JSON Schema at
`@mizen-labs/cli/schema/v1.json`, with identifier `urn:mizen:cli:output:v1`.
It covers help, version, search, info, doctor, init, and errors. No network request
is needed to resolve it. For example, in Node with your own validator:

```js
import Ajv from "ajv";
import schema from "@mizen-labs/cli/schema/v1.json" with { type: "json" };

const validate = new Ajv({ strict: true }).compile(schema);
const response = JSON.parse(stdout);
if (!validate(response)) {
  throw new Error(JSON.stringify(validate.errors));
}
```

The envelope is fixed. Payload objects allow additive fields; known fields keep
their declared types. `definitions` also provides `HelpOutput`, `VersionOutput`,
`SearchOutput`, `InfoOutput`, `DoctorOutput`, `InitOutput`, and `ErrorOutput` for
clients that need a specific command's shape. Component contracts remain open
objects because the docs define their component-specific content.

Validate the complete JSON response and check the process exit separately. Doctor
failures use a doctor report with exit 1. Init installation/verification failures
use an init report with exit 1. They do not become error envelopes. Other failures
use the documented error envelope. Schema version 1 remains a prerelease contract;
breaking changes require a new schema version.

Tests validate actual responses across all documented components, diagnostic
fixtures, init plans, application, conflicts, and recovery. Archive tests resolve
the schema through the installed package export. Ajv is a development dependency;
the CLI runtime does not load a validator or validate its own output on each run.

## Maintainer benchmarks

From the repository root:

```sh
pnpm benchmark:cli
pnpm benchmark:cli --from /absolute/path/to/saved/cli-benchmark-directory
```

The harness measures fresh installed CLI processes for help, search, info, and a
healthy React/Vite doctor target. It records 20 samples per command, first-run and
warmup timings, package sizes, machine details, hashes, and locked replay inputs.
Reports live under `artifacts/benchmarks/`. Package CI adds a job summary and
uploads the reports for each OS/Node pair. Results are informational; no timing
threshold is enforced.
