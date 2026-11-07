"use client";

import { useCallback, useRef, useState } from "react";

/** `copied` until the timeout passes; `failed` until the next attempt. */
export type CopyStatus = "copied" | "failed" | "idle";

export interface UseCopyToClipboardOptions {
	/** Called with the text after a copy succeeds. */
	onCopy?: (text: string) => void;
	/** Milliseconds before `copied` returns to `idle`. 0 keeps it. */
	timeout?: number;
}

/**
 * Copies text to the clipboard and reports how it went, so a button can show
 * a check and a status region can announce the result. Pass a promise to
 * copy text that is still loading.
 */
export function useCopyToClipboard({
	onCopy,
	timeout = 2000,
}: UseCopyToClipboardOptions = {}) {
	const [status, setStatus] = useState<CopyStatus>("idle");
	// Only the latest attempt reports, and a new one cancels the reset.
	const latest = useRef(0);
	const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const copy = useCallback(
		async (value: string | Promise<string>) => {
			latest.current += 1;
			const attempt = latest.current;
			clearTimeout(reset.current);
			let text: string | undefined;
			try {
				text = await value;
				await navigator.clipboard.writeText(text);
			} catch {
				text = undefined;
			}
			if (attempt !== latest.current) {
				return text !== undefined;
			}
			if (text === undefined) {
				setStatus("failed");
				return false;
			}
			setStatus("copied");
			onCopy?.(text);
			if (timeout > 0) {
				reset.current = setTimeout(() => setStatus("idle"), timeout);
			}
			return true;
		},
		[onCopy, timeout]
	);
	return { copy, status };
}
