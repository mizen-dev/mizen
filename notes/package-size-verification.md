# Package-size correction — 2026-11-07

The @mizen-labs/ui archive fell from 774,870 to 675,955 bytes: 98,915 bytes smaller,
with 4,045 bytes remaining under the unchanged 680,000-byte limit.

The production build now:

- Uses Babel's compact formatting for generated JavaScript. This does not mangle
  names or apply new code optimizations. Comments and client directives remain.
- Asks the installed TypeScript compiler for the declaration dependency graph
  rooted at all 136 public type entry points. It removes only generated .d.ts
  files outside that graph. In this build, 201 unreachable declarations were
  removed, mostly inferred private StyleX types.

The graph uses the same ESNext/bundler resolution as the package's TypeScript
configuration. Missing public roots abort pruning before any deletion. No source,
JavaScript, CSS, public type dependency or package export is removed. No new
runtime or build dependency is needed.

Trade-off: compiled production JavaScript is less readable. The readable source
files still ship, and the development watch command keeps its existing formatting.
Generated private declarations that public imports cannot reach no longer ship.

Verification:

- Compared the previous and candidate archives: all 395 JavaScript ASTs match,
  including comment text; all 9 CSS files match byte-for-byte; all 395 non-CSS
  source files match byte-for-byte. No component source or appearance changed.
- Added pruning tests that preserve transitive types, including extensionless
  imports, import-type expressions and a required stylesheet declaration. They
  also verify unchanged runtime assets and safe failure for a missing entry.
- Both packed Next and TanStack Start production consumers pass. The final
  distribution, pruning and example-source run passes 8 tests across 4 files.
- Next measured archive 675,955 / 680,000, JS 242,690 / 270,000, and CSS
  34,959 / 36,000 bytes. Existing budget assertions remain unchanged.
- Public export files and client boundaries pass package-distribution checks.
  Public-type consumer checks and the 511-example source checks pass.
- pnpm lint, pnpm -r typecheck, npx biome check ., and pnpm build pass.
  Production builds cover UI, CLI and docs.

Packed tests used MIZEN_DOCS_TEST_URL=http://localhost:3000 and
MIZEN_PACKED_CONSUMER=1. The existing port-3000 server was not stopped.
No dependency, notice, public import, runtime behavior or visual token changed.

## Declaration-pruning edge review — 2026-11-07

The follow-up found two weaknesses in the first implementation: it collected
only flat `types` entries, and `--listFilesOnly` could return a graph despite
unresolved transitive imports. The earlier consumer fixture also imported only
a subset of public modules with skipLibCheck enabled.

Pruning now collects nested export conditions, fallback arrays, direct source
entries, inferred JS/MJS/CJS declaration siblings, and root types/typings entries.
Null export targets are ignored. It handles .d.ts, .d.mts and .d.cts, and removes
a declaration map only when its corresponding declaration is removed.

The compiler now performs strict checking with skipLibCheck disabled before
pruning. CSS has a narrow ambient module declaration because bundlers consume
those assets. Missing TypeScript imports, import-type expressions, triple-slash
references, syntax errors and semantic errors stop the build before any deletion.
The compiler follows cycles and ambient references. Temporary compiler inputs
are cleaned up on both success and failure.

Wildcard exports, typesVersions and package imports mappings now stop pruning
explicitly until their resolution rules are accounted for. The current package
uses none of these layouts. This is a fail-before-deletion safeguard, not a claim
that those future layouts have been fully implemented. Strict checking adds
build work and can surface dependency type errors that skipLibCheck previously
hid; the current dependency set passes.

Packed verification now imports every one of the 149 public subpaths from the
installed archive with skipLibCheck:false and no workspace paths. It checks:

- Bundler resolution using compiled declarations.
- NodeNext ESM import resolution.
- NodeNext CommonJS require resolution.
- The public source condition.

The first three modes pass without Diagram's optional peer. The source condition
exposes Diagram implementation imports and therefore requires the declared pele
peer. The audit installs that peer only in the temporary consumer before its
source-condition pass. Project dependencies and package contracts are unchanged.
A negative control temporarily withholds the installed dist/closed.d.ts and
requires the audit to reject that missing transitive type. The file is restored
in finally before any further consumer work. All compiler processes finish
before this mutation or test cleanup, preventing cross-mode races.

Final verification:

- 12 pruning edge tests pass, including preservation on every failure case.
- All four public-import modes and the missing-type negative control pass.
- Both packed Next and TanStack Start production consumers pass.
- The combined distribution, pruning, packed-consumer and source-contract run
  passes 18 tests across 4 files; the 511-example source checks pass.
- pnpm lint, pnpm -r typecheck, npx biome check ., and pnpm build pass.
- The final workspace includes concurrent UI updates. Its packed archive is
  676,228 bytes, still below the unchanged 680,000 limit. Next measures JS
  242,723 / 270,000 and CSS 34,935 / 36,000 bytes. No budget assertion changed.

This review changed only build tooling, tests and this record. Other agents'
landing-page and UI commits were preserved. No runtime or styling source was
changed by this review, and no dependency was added to the project. Browser
checkpoints used MIZEN_DOCS_TEST_URL=http://localhost:3000; the existing server
was not stopped.
