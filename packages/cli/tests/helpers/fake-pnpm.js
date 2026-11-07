import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";

export function fakePnpm(root, source) {
	const bin = join(root, "bin");
	mkdirSync(bin, { recursive: true });
	writeFileSync(join(bin, "fake-pnpm.cjs"), source);
	writeFileSync(join(bin, "pnpm"), `#!/usr/bin/env node\n${source}\n`);
	chmodSync(join(bin, "pnpm"), 0o755);
	writeFileSync(
		join(bin, "pnpm.cmd"),
		`@echo off\r\n"${process.execPath}" "%~dp0fake-pnpm.cjs" %*\r\n`
	);
	const key =
		Object.keys(process.env).find((name) => name.toLowerCase() === "path") ??
		"PATH";
	return {
		...process.env,
		[key]: `${bin}${delimiter}${process.env[key] ?? ""}`,
	};
}
