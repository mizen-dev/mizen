import spawn from "cross-spawn";

// Resolve Windows package-manager .cmd shims without assembling shell commands.
export function execute(command, args, options = {}) {
	const result = spawn.sync(command, args, {
		encoding: "utf8",
		maxBuffer: 4_000_000,
		timeout: 180_000,
		...options,
	});
	if (result.error || result.status !== 0) {
		throw new Error(
			`${command} ${args.join(" ")} failed (${result.error?.code ?? result.status}):\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
			{ cause: result.error }
		);
	}
	return result.stdout;
}
