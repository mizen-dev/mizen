import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execute } from "../process.js";

const smoke = `import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
const entry = (name) => new URL(import.meta.resolve(name));
for (const name of ["@mizen-labs/ui/button", "@mizen-labs/ui/theme/initialize"]) {
  assert.ok(statSync(entry(name)).size > 0);
}
const schema = JSON.parse(readFileSync(entry("@mizen-labs/cli/schema/v1.json"), "utf8"));
assert.equal(schema.$id, "urn:mizen:cli:output:v1");
const css = readFileSync(entry("@mizen-labs/ui/styles.css"), "utf8");
assert.ok(css.length > 0);
assert.ok(!css.includes("@stylex;"));
`;

export async function checkConsumer(
	staging,
	manager,
	version,
	reactVersion,
	pnpmDeclaration
) {
	const declaration =
		manager === "pnpm"
			? pnpmDeclaration
			: `npm@${execute("npm", ["--version"]).trim()}`;
	const directory = join(staging, "consumers", manager);
	await mkdir(directory, { recursive: true });
	await writeFile(
		join(directory, "package.json"),
		`${JSON.stringify(
			{
				dependencies: {
					"@mizen-labs/cli": "file:../../mizen-cli.tgz",
					"@mizen-labs/ui": "file:../../mizen-ui.tgz",
					react: reactVersion,
					"react-dom": reactVersion,
				},
				name: `mizen-release-${manager}`,
				packageManager: declaration,
				private: true,
				type: "module",
			},
			null,
			2
		)}\n`
	);
	const install =
		manager === "npm"
			? [
					"install",
					"--ignore-scripts",
					"--no-audit",
					"--no-fund",
					"--include=dev",
				]
			: ["install", "--ignore-scripts", "--no-frozen-lockfile", "--prod=false"];
	execute(manager, install, { cwd: directory });
	const prefix =
		manager === "npm" ? ["exec", "--no", "--", "mizen"] : ["exec", "mizen"];
	const run = (args) =>
		execute(manager, [...prefix, ...args], { cwd: directory });
	assert.equal(run(["--version"]).trim(), version);
	const info = JSON.parse(run(["info", "button", "--json"]));
	assert.equal(info.schemaVersion, 1);
	assert.equal(info.data.component.entryPoint, "@mizen-labs/ui/button");
	const doctor = JSON.parse(run(["doctor", "--json"]));
	assert.equal(doctor.data.summary.errors, 0, JSON.stringify(doctor.data));
	assert.equal(doctor.data.uiVersion, version);
	assert.equal(
		doctor.data.status,
		"incomplete",
		"A framework-free smoke project must remain explicitly unverified."
	);
	await writeFile(join(directory, "smoke.mjs"), smoke);
	execute(process.execPath, ["smoke.mjs"], { cwd: directory });
	const managerVersion = execute(manager, ["--version"], {
		cwd: directory,
	}).trim();
	assert.equal(
		`${manager}@${managerVersion}`,
		declaration,
		"Consumer must use the selected package-manager version."
	);
	return {
		lockfile: manager === "npm" ? "package-lock.json" : "pnpm-lock.yaml",
		manager,
		version: managerVersion,
	};
}

export async function copyConsumerEvidence(staging, destination, result) {
	const directory = join(destination, "consumers", result.manager);
	await mkdir(directory, { recursive: true });
	await Promise.all(
		["package.json", result.lockfile, "smoke.mjs"].map(async (file) => {
			await writeFile(
				join(directory, file),
				await readFile(join(staging, "consumers", result.manager, file))
			);
		})
	);
}
