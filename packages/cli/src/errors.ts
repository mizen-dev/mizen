import { nextStep, row, type Style, status } from "./output.js";

/** A recovery step: what it gets you, and the exact command. */
export interface Recovery {
	argv: readonly string[];
	benefit: string;
}

const SAFE = /^[\w./:=@<>-]+$/;

/** argv as one command line, quoting what the shell would split. */
export function commandLine(argv: readonly string[]): string {
	return argv
		.map((arg) => (SAFE.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`))
		.join(" ");
}

export interface Failure {
	/** Choices or a suggestion, for machine output. */
	data?: Record<string, unknown>;
	next?: Recovery;
	/** Context rows under the headline, such as the file or directory. */
	rows?: readonly (readonly [string, string])[];
}

/**
 * A failure with one class. `reason` is a stable snake_case code; the exit
 * code is 2 for usage and missing input, 1 for every other failure.
 */
export class CliError extends Error {
	readonly reason: string;
	readonly exitCode: 1 | 2;
	readonly detail: Failure;

	constructor(
		reason: string,
		message: string,
		exitCode: 1 | 2,
		detail: Failure = {}
	) {
		super(message);
		this.reason = reason;
		this.exitCode = exitCode;
		this.detail = detail;
	}
}

function seeHelp(command?: string): Recovery {
	return {
		argv: ["mizen", ...(command ? [command] : []), "--help"],
		benefit: "See usage",
	};
}

export function invalidUsage(
	message: string,
	command?: string,
	reason = "invalid_arguments"
): never {
	throw new CliError(reason, message, 2, { next: seeHelp(command) });
}

const UNKNOWN_OPTION = /Unknown option '([^']+)'/;

export function normalizeError(error: unknown, command?: string): CliError {
	if (error instanceof CliError) {
		return error;
	}
	const message = error instanceof Error ? error.message : String(error);
	const code =
		error instanceof TypeError && "code" in error ? String(error.code) : "";
	const where = `mizen${command ? ` ${command}` : ""}`;
	if (code === "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
		const option = UNKNOWN_OPTION.exec(message)?.[1] ?? "option";
		return new CliError(
			"unknown_option",
			`Unknown option ${option} for ${where}.`,
			2,
			{ next: seeHelp(command) }
		);
	}
	if (code.startsWith("ERR_PARSE_ARGS")) {
		return new CliError(
			"invalid_arguments",
			`Can't read the options for ${where}. ${message}`,
			2,
			{ next: seeHelp(command) }
		);
	}
	return new CliError(
		"internal_error",
		`Unexpected error in ${where}. This is a bug in Mizen CLI.`,
		1,
		{
			next: {
				argv: ["mizen", "--version"],
				benefit: "Report it with your version",
			},
			rows: [["Cause", message]],
		}
	);
}

/** The human error block, for stderr. */
export function formatError(style: Style, failure: CliError): string {
	const { next, rows = [] } = failure.detail;
	return [
		status(style, "fail", failure.message),
		...rows.map(([label, value]) => row(label, value)),
		...(next
			? ["", nextStep(style, next.benefit, commandLine(next.argv))]
			: []),
	].join("\n");
}

/** The machine error document: one line on stderr. */
export function errorDocument(failure: CliError) {
	const { data, next } = failure.detail;
	return {
		error: {
			...(data ? { data } : {}),
			message: failure.message,
			...(next
				? { next: [{ argv: next.argv, command: commandLine(next.argv) }] }
				: {}),
			reason: failure.reason,
		},
		schemaVersion: 1,
	};
}
