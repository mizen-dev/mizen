"use client";

import { props } from "@stylexjs/stylex";
import type {
	ComponentPropsWithRef,
	MouseEventHandler,
	ReactNode,
} from "react";
import type { Closed } from "../../closed";
import { IconX } from "../../icons";
import { colors } from "../../styles/colors.stylex";
import { palette } from "../../styles/palette.stylex";
import { typographyStyles } from "../../styles/typography.styles";
import { tokenStyles } from "./token.styles";

export type TokenColor =
	| "default"
	| "red"
	| "orange"
	| "yellow"
	| "green"
	| "teal"
	| "cyan"
	| "blue"
	| "purple"
	| "pink"
	| "gray";
export type TokenSize = "sm" | "md" | "lg";
export type TokenProps = Omit<
	Closed<ComponentPropsWithRef<"span">>,
	"children" | "data-slot" | "onClick" | "role"
> & {
	label: string;
	color?: TokenColor;
	size?: TokenSize;
	icon?: ReactNode;
	endContent?: ReactNode;
	href?: string;
	disabled?: boolean;
	onClick?: MouseEventHandler<HTMLElement>;
	onRemove?: MouseEventHandler<HTMLElement>;
};
const tones = {
	blue: palette.blue700,
	cyan: `color-mix(in oklch, ${palette.blue700}, ${palette.teal700})`,
	default: colors.mutedContent,
	gray: colors.mutedContent,
	green: palette.green700,
	orange: palette.orange700,
	pink: palette.pink700,
	purple: palette.violet700,
	red: palette.rose700,
	teal: palette.teal700,
	yellow: palette.amber700,
};
const sizes = { lg: tokenStyles.lg, md: tokenStyles.md, sm: tokenStyles.sm };

type ActionProps = Pick<
	TokenProps,
	| "label"
	| "aria-description"
	| "href"
	| "disabled"
	| "onClick"
	| "aria-pressed"
>;
function TokenAction({
	label,
	"aria-description": description,
	href,
	disabled,
	onClick,
	"aria-pressed": pressed,
}: ActionProps) {
	if (href) {
		return (
			<a
				aria-description={description}
				aria-disabled={disabled || undefined}
				aria-label={label}
				href={disabled ? undefined : href}
				onClick={disabled ? undefined : onClick}
				role={disabled ? "link" : undefined}
				tabIndex={disabled ? -1 : undefined}
				{...props(tokenStyles.action)}
			/>
		);
	}
	return (
		<button
			aria-description={description}
			aria-label={label}
			aria-pressed={pressed}
			disabled={disabled}
			onClick={onClick}
			type="button"
			{...props(tokenStyles.action)}
		/>
	);
}

function TokenContents({
	actionable,
	icon,
	endContent,
	disabled,
	label,
	onRemove,
}: Pick<
	TokenProps,
	"icon" | "endContent" | "disabled" | "label" | "onRemove"
> & { actionable: boolean }) {
	return (
		<>
			{" "}
			{icon ? (
				<span aria-hidden {...props(tokenStyles.adornment)}>
					{icon}
				</span>
			) : null}
			<span
				aria-hidden={actionable}
				{...props(tokenStyles.label, typographyStyles.controlLabel)}
			>
				{label}
			</span>
			{endContent ? (
				<span {...props(tokenStyles.adornment)}>{endContent}</span>
			) : null}
			{onRemove ? (
				<button
					aria-label={`Remove ${label}`}
					disabled={disabled}
					onClick={onRemove}
					type="button"
					{...props(tokenStyles.remove)}
				>
					<IconX aria-hidden size={12} />
				</button>
			) : null}
		</>
	);
}

function getTokenStyles(color: TokenColor, size: TokenSize, disabled: boolean) {
	return props(
		tokenStyles.root,
		sizes[size],
		color !== "default" && tokenStyles.tint(tones[color]),
		disabled && tokenStyles.disabled
	);
}

export function Token({
	label,
	color = "default",
	size = "md",
	icon,
	endContent,
	"aria-description": description,
	href,
	disabled = false,
	onClick,
	onRemove,
	ref,
	"aria-pressed": pressed,
	...rest
}: TokenProps) {
	if (!label.trim()) {
		throw new TypeError("Token requires a non-empty label.");
	}
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const actionable = Boolean(href || onClick);
	return (
		<span
			{...rest}
			aria-description={description}
			data-color={color}
			data-disabled={disabled || undefined}
			data-size={size}
			data-slot="token"
			ref={ref}
			title={label}
			{...getTokenStyles(color, size, disabled)}
		>
			{actionable ? (
				<TokenAction
					aria-description={description}
					aria-pressed={pressed}
					disabled={disabled}
					href={href}
					label={label}
					onClick={onClick}
				/>
			) : null}
			<TokenContents
				actionable={actionable}
				disabled={disabled}
				endContent={endContent}
				icon={icon}
				label={label}
				onRemove={onRemove}
			/>
		</span>
	);
}
