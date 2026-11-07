import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { execute as execFileSync } from "../scripts/process.js";
import { parseOutput } from "./helpers/output.js";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const binary = join(repository, "packages/cli/dist/cli.js");
const checkpoint = process.env.MIZEN_PACKED_CONSUMER === "1";

test("doctor verifies both real installed framework fixtures from a packed UI archive", {
	skip: !checkpoint,
	timeout: 300_000,
}, () => {
	const destination = mkdtempSync(join(tmpdir(), "mizen-doctor-consumers-"));
	try {
		const archive = join(destination, "mizen-ui.tgz");
		execFileSync("pnpm", ["pack", "--out", archive], {
			cwd: join(repository, "packages/ui"),
			stdio: "pipe",
			timeout: 120_000,
		});
		for (const target of ["package-consumer", "package-consumer-start"]) {
			const app = join(destination, target);
			cpSync(join(repository, "apps/docs/tests", target), app, {
				recursive: true,
			});
			cpSync(archive, join(app, "mizen-ui.tgz"));
			execFileSync(
				"pnpm",
				["install", "--ignore-scripts", "--no-frozen-lockfile"],
				{ cwd: app, stdio: "pipe", timeout: 120_000 }
			);
			const manifestBefore = readFileSync(join(app, "package.json"), "utf8");
			const result = parseOutput(
				execFileSync(
					process.execPath,
					[binary, "doctor", "--cwd", app, "--strict", "--json"],
					{ encoding: "utf8", timeout: 10_000 }
				)
			);
			assert.equal(result.data.status, "healthy", JSON.stringify(result.data));
			assert.equal(
				readFileSync(join(app, "package.json"), "utf8"),
				manifestBefore
			);
		}
	} finally {
		rmSync(destination, { force: true, recursive: true });
	}
});
