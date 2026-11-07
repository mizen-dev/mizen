"use client";

import { props } from "@stylexjs/stylex";
import { useCallback } from "react";
import { Button } from "./components/button/button";
import { visuallyHiddenStyles } from "./components/visually-hidden/visually-hidden.styles";
import { IconCheck, IconCopy } from "./icons";
import { useCopyToClipboard } from "./use-copy-to-clipboard";

/** Copies text, then shows a check and announces the result. */
export function CopyButton({ label, text }: { label: string; text: string }) {
	const { copy, status } = useCopyToClipboard();
	const copyText = useCallback(() => copy(text), [copy, text]);
	const Icon = status === "copied" ? IconCheck : IconCopy;
	return (
		<>
			<Button
				aria-label={label}
				onClick={copyText}
				size="icon-xs"
				variant="ghost"
			>
				<Icon aria-hidden="true" size="1em" />
			</Button>
			{/* Rendered empty first, so the update is announced. */}
			<span
				aria-live="polite"
				role="status"
				{...props(visuallyHiddenStyles.root)}
			>
				{status === "copied" ? "Copied" : null}
				{status === "failed"
					? "Could not copy. Select the text to copy it."
					: null}
			</span>
		</>
	);
}
