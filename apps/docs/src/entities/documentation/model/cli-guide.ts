import type { Guide } from "./guides";

export const cliGuide: Guide = {
	description:
		"Find components, inspect application setup, and preview changes before applying them.",
	sections: [
		{
			code: {
				title: "sh",
				value: `npm install --save-dev @mizen-labs/cli
npx --no-install mizen --help
# With pnpm:
# pnpm add --save-dev @mizen-labs/cli
# pnpm exec mizen --help`,
			},
			id: "install",
			links: [
				{
					href: "/docs/installation",
					label: "UI installation and framework setup",
				},
			],
			paragraphs: [
				"The package is @mizen-labs/cli and its executable is mizen. Install it from npm, or run npx @mizen-labs/cli@latest --help for a one-off command.",
				"Install the CLI as a development dependency, then use the local executable. Init installs the UI version matching the CLI catalog when the app has none. Node must satisfy >=22.18.0 <23 or >=24.11.0. npm and pnpm are supported for setup.",
			],
			title: "Install from npm",
		},
		{
			code: {
				title: "sh",
				value: `pnpm --filter @mizen-labs/cli pack --out ./mizen-cli.tgz
pnpm --filter @mizen-labs/ui pack --out ./mizen-ui.tgz`,
			},
			id: "pack",
			paragraphs: [
				"Maintainers can produce the archives from the Mizen repository. Each command runs inside its selected package: the files land in packages/cli and packages/ui. Use these archives only when testing local changes; normal installation uses npm.",
			],
			title: "Pack archives from this repository",
		},
		{
			code: {
				title: "sh",
				value: `npx --no-install mizen search keyboard navigation
npx --no-install mizen info button
npx --no-install mizen info "Activity Feed" --json`,
			},
			id: "discover",
			paragraphs: [
				"Search matches every query word, ignoring case. With no query it lists the catalog. Info accepts a component slug or name and shows imports, API, guidance, and documented examples.",
				"Discovery is offline. Each CLI release describes the UI release of the same number, so run the CLI version your app has installed: npx @mizen-labs/cli@<version> info button. Search and info read the installed @mizen-labs/ui manifest and warn when its version differs. Info fails when the installed version lacks the component. Use each command's --help for its options and examples.",
			],
			title: "Find and inspect components",
		},
		{
			code: {
				title: "sh",
				value: `npx --no-install mizen doctor --cwd ./apps/web
npx --no-install mizen doctor --cwd ./apps/web --strict --json`,
			},
			id: "doctor",
			paragraphs: [
				"Doctor checks installed package compatibility, React identity, stylesheet imports, theme setup, and framework bundling declarations. It supports Next.js App Router, TanStack Start, and conventional plain React + Vite apps.",
				"It reads files without running app configuration or package-manager hooks. It does not build or run your app. For bundling it reads an object literal that the configuration exports, passes to defineConfig, or returns at the end of a config function. For the theme it reads the root document, and for TanStack Start also the Wrap and InnerWrap of createRouter in the router module beside the routes. A computed, spread, or conditional setting, or a provider in another component, stays unverified.",
				"--strict fails when any check remains unverified, so use it as a CI gate only when doctor can read every setup shape in the app. Otherwise run without --strict and confirm each unverified check by the evidence its repair step names: a production server build that renders a Mizen component, or a first paint with the stored theme and no hydration mismatch.",
				"A workspace root is not checked by a plain run, even when the root is itself an app. Run doctor --workspace to check the root app and every member.",
			],
			title: "Check an application",
		},
		{
			code: {
				title: "sh",
				value: `npx --no-install mizen doctor --workspace
npx --no-install mizen doctor --workspace --cwd . --strict --json
# Inspect a skipped or linked app explicitly:
npx --no-install mizen doctor --cwd ./apps/web --strict`,
			},
			id: "workspace",
			paragraphs: [
				"--workspace finds the nearest workspace declaration from the current directory or --cwd anchor. It reads pnpm-workspace.yaml or package.json workspaces patterns, including exclusions. pnpm-workspace.yaml takes precedence when both exist; differing declarations remain unverified.",
				"The report lists each supported app with its framework and result. Ordinary libraries are skipped with a reason. Invalid package manifests are errors and do not prevent inspection of other apps. Ambiguous frameworks, linked or external members, and unclear React + Vite library layouts remain unverified. node_modules and .git are excluded from discovery.",
				"JSON keeps the doctor envelope. data.apps contains per-app reports, data.skipped explains omitted packages, and data.workspace identifies the declaration. Flattened diagnostics carry an app project path; the top-level summary counts all diagnostics. No supported apps produces an incomplete result. Use --strict for CI. Init remains targeted with --cwd and does not accept --workspace.",
			],
			title: "Check a workspace",
		},
		{
			code: {
				title: "sh",
				value: `cd ./apps/web
npm install --save-dev @mizen-labs/cli@0.2.0
npx --no-install mizen init --dry-run
npx --no-install mizen init --yes
npx --no-install mizen doctor --strict`,
			},
			id: "init",
			paragraphs: [
				"Init returns a plan by default. Review its source diffs and dependency command, then rerun with --yes. --dry-run prevents application even when --yes is present. The plan installs the matching @mizen-labs/ui version when the app has none, and stops when the app resolves another version.",
				"The package manager must agree with the app's declaration and lockfiles. For an app without either, select --package-manager npm or pnpm. --feature diagram installs the optional diagram peer when requested. --preset vivid writes mizen-theme.css, a theme file the app owns, and imports it after the Mizen stylesheet; it also works on an app already set up, and never replaces a file that differs. Installation skips lifecycle scripts. Source edits preserve existing providers, comments, and unrelated configuration.",
			],
			title: "Preview and apply setup",
		},
		{
			code: {
				title: "sh",
				value: `npx --no-install mizen init --help
npx --no-install mizen doctor --cwd ./apps/web --strict
npx --no-install mizen --version`,
			},
			id: "recovery",
			paragraphs: [
				"--yes does not bypass conflicts. Resolve the named file or declaration before retrying. Failed verification includes diagnostic IDs, paths, and repair steps.",
				"A failed dependency installation leaves source files unchanged, but package.json, lockfiles, or node_modules may have changed. Repair installation and rerun doctor. Source rollback preserves detected caller edits.",
				"An interrupted run can leave .mizen-init-journal.json with original and proposed source text. Review it and restore or finish the recorded edits before removing it. The next init stops while the journal remains. Help and version reporting remain usable if the bundled catalog is damaged.",
			],
			title: "Resolve failures",
		},
		{
			code: {
				title: "json",
				value: `{
  "schemaVersion": 1,
  "command": "doctor",
  "data": {
    "project": null,
    "status": "failed",
    "diagnostics": [
      {
        "id": "project.target",
        "status": "error",
        "message": "No package.json was found.",
        "evidence": [
          "/workspace"
        ],
        "repair": "Use --cwd path/to/app."
      }
    ],
    "summary": {
      "errors": 1,
      "unverified": 0,
      "passed": 0
    }
  }
}`,
			},
			id: "automation",
			links: [
				{ href: "/docs/for-agents", label: "Guidance for coding agents" },
			],
			paragraphs: [
				"--json prints one schema version 1 document. Results go to stdout; an error goes to stderr as one line, with a stable reason and the next command to run. The package exports a local Draft-07 schema at @mizen-labs/cli/schema/v1.json. Payloads permit additive fields; command names, field types, and reasons define the contract.",
				"Check the process exit separately: 0 means success, including a plan or no changes needed; 2 is invalid usage or missing input; 1 is every other failure, including failed doctor checks, unverified checks with --strict, init conflicts, and failed installs.",
				"Doctor failures remain doctor reports. Init installation or verification failures remain init reports. Other failures use an error envelope. Human messages can change; automation should use fields and codes. Source previews can contain local application code, so choose where to store or share them.",
			],
			title: "Use JSON and exit codes",
		},
	],
	slug: "cli",
	title: "CLI",
};
