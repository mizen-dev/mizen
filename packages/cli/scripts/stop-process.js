function waitForExit(child, timeout) {
	if (child.exitCode !== null || child.signalCode !== null) {
		return Promise.resolve(true);
	}
	return new Promise((resolve) => {
		const exited = () => {
			clearTimeout(timer);
			resolve(true);
		};
		const timer = setTimeout(() => {
			child.off("exit", exited);
			resolve(false);
		}, timeout);
		child.once("exit", exited);
	});
}

// Only pass children owned by the test. Never stop an external docs server.
export async function stopProcess(child, graceMs = 3000) {
	if (!child || child.exitCode !== null || child.signalCode !== null) {
		return;
	}
	const exited = waitForExit(child, graceMs);
	child.kill("SIGTERM");
	if (await exited) {
		return;
	}
	const killed = waitForExit(child, 2000);
	child.kill("SIGKILL");
	if (!(await killed)) {
		throw new Error(`Test process ${child.pid} did not exit after SIGKILL`);
	}
}
