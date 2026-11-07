import { useCallback, useRef, useState } from "react";

// Measures how long work took from the DOM, never during render: the element
// shown while working marks the start when it mounts, and the one shown once
// settled marks the end when it replaces it.
export function useElapsed() {
	const start = useRef<number | undefined>(undefined);
	const [seconds, setSeconds] = useState<number>();
	const markStart = useCallback((node: HTMLElement | null) => {
		if (node && start.current === undefined) {
			start.current = performance.now();
		}
	}, []);
	const markEnd = useCallback((node: HTMLElement | null) => {
		if (node && start.current !== undefined) {
			const elapsed = (performance.now() - start.current) / 1000;
			start.current = undefined;
			setSeconds(elapsed);
		}
	}, []);
	return { markEnd, markStart, seconds };
}

/** Whole seconds: "7s", or "1m 35s" past a minute. */
export function formatSeconds(seconds: number) {
	const total = Math.max(1, Math.round(seconds));
	const minutes = Math.floor(total / 60);
	const rest = total % 60;
	if (minutes === 0) {
		return `${rest}s`;
	}
	return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

/** Tenths under ten seconds, for quick work such as tool calls: "0.4s". */
export function formatShortSeconds(seconds: number) {
	return seconds < 10
		? `${Math.max(0.1, Math.round(seconds * 10) / 10)}s`
		: formatSeconds(seconds);
}
