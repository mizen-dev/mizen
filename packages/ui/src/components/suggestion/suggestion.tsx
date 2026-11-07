"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, type ReactNode, useCallback } from "react";
import type { Closed } from "../../closed";
import { buttonStyles } from "../button/button.styles";
import { scrollAreaStyles } from "../scroll-area/scroll-area.styles";
import { suggestionStyles as styles } from "./suggestion.styles";

export type SuggestionsProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"data-slot" | "role"
> & {
	/** Names the row for screen readers. */
	"aria-label"?: string;
	children: ReactNode;
};

/**
 * A row of prompts the person can send in one click, above the composer.
 * It stays one line: when the pills outrun the space it scrolls sideways,
 * and its edges fade where more wait.
 */
export function Suggestions({
	"aria-label": ariaLabel = "Suggestions",
	children,
	ref,
	...rest
}: SuggestionsProps) {
	for (const prop of ["className", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	return (
		// The faded edges say there is more. Touch, trackpads, and focus scroll
		// the row; a thin thumb appears on hover for a mouse.
		<BaseScrollArea.Root
			aria-label={ariaLabel}
			ref={ref}
			role="group"
			{...props(scrollAreaStyles.root, styles.fit, styles.root)}
		>
			<BaseScrollArea.Viewport
				{...props(
					scrollAreaStyles.viewport,
					scrollAreaStyles.viewportFade,
					scrollAreaStyles.viewportOverscrollContain,
					styles.fit,
					styles.viewport
				)}
			>
				<BaseScrollArea.Content
					{...rest}
					data-slot="suggestions"
					{...props(styles.row)}
				>
					{children}
				</BaseScrollArea.Content>
			</BaseScrollArea.Viewport>
			<BaseScrollArea.Scrollbar
				orientation="horizontal"
				{...props(
					scrollAreaStyles.scrollbar,
					scrollAreaStyles.scrollbarHorizontal,
					styles.scrollbar
				)}
			>
				<BaseScrollArea.Thumb {...props(scrollAreaStyles.thumb)} />
			</BaseScrollArea.Scrollbar>
		</BaseScrollArea.Root>
	);
}

export type SuggestionProps = Omit<
	Closed<ComponentPropsWithRef<"button">>,
	"children" | "data-slot" | "onClick" | "type"
> & {
	/** A glyph before the words, such as a test tube for "Write tests". */
	icon?: ReactNode;
	/** Called with the suggestion, which is the message to send. */
	onClick?: (suggestion: string) => void;
	/** The prompt, shown as the label and passed to `onClick`. */
	suggestion: string;
};

/** One prompt: an outline pill whose label is the message it sends. */
export function Suggestion({
	disabled = false,
	icon,
	onClick,
	ref,
	suggestion,
	...rest
}: SuggestionProps) {
	for (const prop of ["className", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	const send = useCallback(() => onClick?.(suggestion), [onClick, suggestion]);
	return (
		<BaseButton
			{...rest}
			data-slot="suggestion"
			disabled={disabled}
			onClick={send}
			ref={ref}
			type="button"
			{...props(
				buttonStyles.base,
				buttonStyles.outline,
				buttonStyles.sm,
				disabled ? buttonStyles.disabled : buttonStyles.press,
				disabled ? null : buttonStyles.interactionOutline,
				styles.pill
			)}
		>
			{icon ? (
				<span aria-hidden="true" {...props(styles.glyph)}>
					{icon}
				</span>
			) : null}
			{suggestion}
		</BaseButton>
	);
}
