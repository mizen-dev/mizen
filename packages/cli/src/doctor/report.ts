import { isAbsolute, relative } from "node:path";
import { plural, row, type Style, status as statusLine } from "../output.js";

export type CheckStatus = "pass" | "error" | "unverified";
export interface Diagnostic {
	evidence: string[];
	id: string;
	message: string;
	packageManager?: string;
	repair?: string;
	status: CheckStatus;
}

export function check(
	id: string,
	status: CheckStatus,
	message: string,
	evidence: string[] = [],
	repair?: string
): Diagnostic {
	return {
		evidence,
		id,
		message,
		status,
		...(repair && status !== "pass" ? { repair } : {}),
	};
}

export function report(project: string | null, diagnostics: Diagnostic[]) {
	const errors = diagnostics.filter((item) => item.status === "error").length;
	const unverified = diagnostics.filter(
		(item) => item.status === "unverified"
	).length;
	let status = "healthy";
	if (unverified) {
		status = "incomplete";
	}
	if (errors) {
		status = "failed";
	}
	return {
		diagnostics,
		project,
		status,
		summary: {
			errors,
			passed: diagnostics.length - errors - unverified,
			unverified,
		},
	};
}

// Paths inside the app read relative to it; others stay absolute.
function shown(path: string, base: string | null): string {
	if (!base) {
		return path;
	}
	const inside = relative(base, path);
	return inside && !inside.startsWith("..") && !isAbsolute(inside)
		? inside
		: path;
}

/** A finding as a status headline with its check, evidence, and fix. */
export function formatDiagnostic(
	style: Style,
	item: Diagnostic,
	base: string | null = null
): string[] {
	return [
		statusLine(style, item.status === "error" ? "fail" : "warn", item.message),
		row("Check", item.id),
		...(item.evidence.length
			? [
					row(
						"Evidence",
						item.evidence.map((path) => shown(path, base))
					),
				]
			: []),
		...(item.repair ? [row("Next step", item.repair)] : []),
		"",
	];
}

/** The closing line: the outcome, then the counts. */
export function summaryLine(
	style: Style,
	result: ReturnType<typeof report>
): string {
	const { errors, passed, unverified } = result.summary;
	if (errors) {
		return statusLine(
			style,
			"fail",
			`Found ${plural(errors, "error")}. ${unverified} unverified, ${passed} passed.`
		);
	}
	if (unverified) {
		return statusLine(
			style,
			"warn",
			`Couldn't verify ${plural(unverified, "check")}. ${passed} passed.`
		);
	}
	return statusLine(
		style,
		"pass",
		`Healthy. ${plural(passed, "check")} passed.`
	);
}

// Each passing check's id beside its message, in one aligned column.
function passedRows(passed: Diagnostic[]): string[] {
	const width = Math.max(...passed.map((item) => item.id.length)) + 2;
	return passed.map((item) => `  ${item.id.padEnd(width)}${item.message}`);
}

export function formatReport(
	style: Style,
	result: ReturnType<typeof report>
): string {
	const findings = result.diagnostics.filter((item) => item.status !== "pass");
	const passed = result.diagnostics.filter((item) => item.status === "pass");
	return [
		row("Project", result.project ?? "Not found"),
		"",
		...findings.flatMap((item) =>
			formatDiagnostic(style, item, result.project)
		),
		...(passed.length ? [style.bold("Passed"), ...passedRows(passed), ""] : []),
		summaryLine(style, result),
	].join("\n");
}

/** A diagnostic as an error block's rows, and in full for machines. */
export function diagnosticDetail(item: Diagnostic) {
	const rows: [string, string][] = [
		["Check", item.id],
		...(item.evidence.length
			? [["Evidence", item.evidence.join("\n")] as [string, string]]
			: []),
		...(item.repair ? [["Next step", item.repair] as [string, string]] : []),
	];
	return { data: { diagnostic: item }, rows };
}
