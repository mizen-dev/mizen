"use client";

import { props } from "@stylexjs/stylex";
import { useCallback } from "react";
import { IconCheck, IconCopy } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import {
	type CopyStatus,
	useCopyToClipboard,
} from "../../use-copy-to-clipboard";
import type { ButtonProps } from "../button/button";
import { Button } from "../button/button";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { codeBlockStyles } from "./code-block.styles";

export interface CodeBlockCopyProps {
	code: string;
	ref?: ButtonProps["ref"];
}

const statusMessages: Record<CopyStatus, string | null> = {
	copied: "Copied",
	failed: "Could not copy. Select the code to copy it.",
	idle: null,
};

export function CodeBlockCopy({ code, ref: forwardedRef }: CodeBlockCopyProps) {
	const { copy, status } = useCopyToClipboard();
	const copyCode = useCallback(() => copy(code), [code, copy]);

	return (
		<span data-slot="code-block-copy" {...props(codeBlockStyles.copyControl)}>
			<Button
				aria-label="Copy code"
				onClick={copyCode}
				ref={forwardedRef}
				size="icon-xs"
				title="Copy code"
				type="button"
				variant="ghost"
			>
				{status === "copied" ? (
					<IconCheck aria-hidden="true" size="1em" />
				) : (
					<IconCopy aria-hidden="true" size="1em" />
				)}
			</Button>
			<span
				aria-live="polite"
				data-slot="code-block-copy-status"
				role="status"
				{...props(
					codeBlockStyles.copyStatus,
					typeRoles.ui,
					status !== "failed" && visuallyHiddenStyles.root
				)}
			>
				{statusMessages[status]}
			</span>
		</span>
	);
}
