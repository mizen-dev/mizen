import assert from "node:assert/strict";
import { test } from "node:test";
import { validateOutput } from "./helpers/output.js";

const search = () => ({
	command: "search",
	data: { components: [], query: "button", uiVersion: "0.1.0" },
	schemaVersion: 1,
});

test("the published schema rejects malformed envelopes and command payloads", () => {
	for (const invalid of [
		{ ...search(), schemaVersion: 2 },
		{ ...search(), schemaVersion: "1" },
		{ ...search(), command: "unknown" },
		{ ...search(), data: { components: [], query: "button" } },
		{ command: "help", data: { usage: 42 }, schemaVersion: 1 },
		{ error: { code: "INVALID_USAGE" }, schemaVersion: 1 },
		{ error: { code: "UNKNOWN_ERROR", message: "unknown" }, schemaVersion: 1 },
		{
			...search(),
			error: { code: "INVALID_USAGE", message: "mixed envelopes" },
		},
	]) {
		assert.equal(validateOutput(invalid), false, JSON.stringify(invalid));
	}
});

test("payloads permit additive fields while known fields keep their types", () => {
	const valid = search();
	valid.data.futureField = "compatible addition";
	assert.ok(validateOutput(valid), JSON.stringify(validateOutput.errors));
	valid.data.components = [
		{
			category: "Actions",
			description: "Button",
			entryPoint: 42,
			name: "Button",
			slug: "button",
			status: "stable",
		},
	];
	assert.equal(validateOutput(valid), false);
});

test("doctor reports remain reports on nonzero exit and require typed diagnostics", () => {
	const report = {
		command: "doctor",
		data: {
			diagnostics: [
				{
					evidence: ["/app/package.json"],
					id: "project.target",
					message: "Select an app.",
					repair: "Use --cwd.",
					status: "error",
				},
			],
			project: null,
			status: "failed",
			summary: { errors: 1, passed: 0, unverified: 0 },
		},
		schemaVersion: 1,
	};
	assert.ok(validateOutput(report), JSON.stringify(validateOutput.errors));
	report.data.diagnostics[0].status = "warning";
	assert.equal(validateOutput(report), false);
	report.data.diagnostics[0].status = "error";
	report.data.summary.errors = -1;
	assert.equal(validateOutput(report), false);
});

test("workspace reports keep typed app reports and grouped workspace fields", () => {
	const diagnostic = {
		evidence: [],
		id: "runtime.node",
		message: "Compatible.",
		status: "pass",
	};
	const app = {
		diagnostics: [diagnostic],
		framework: "next",
		name: "web",
		path: "apps/web",
		project: "/repo/apps/web",
		status: "healthy",
		summary: { errors: 0, passed: 1, unverified: 0 },
	};
	const data = {
		...app,
		apps: [app],
		project: "/repo",
		skipped: [],
		workspace: {
			kind: "pnpm",
			patterns: ["apps/*"],
			source: "/repo/pnpm-workspace.yaml",
		},
	};
	const output = { command: "doctor", data, schemaVersion: 1 };
	assert.ok(validateOutput(output), JSON.stringify(validateOutput.errors));
	const missing = structuredClone(output);
	missing.data.apps = undefined;
	assert.equal(validateOutput(missing), false);
	data.apps[0].path = 42;
	assert.equal(validateOutput(output), false);
});
