"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { Popover, PopoverPopup, PopoverPrimitive } from "../popover/popover";
import { Progress } from "../progress/progress";
import { composerPartStyles as styles } from "./composer-parts.styles";
import { ProgressRing } from "./composer-progress-ring";

/** Token counts, named as the AI SDK names them, so its `usage` fits as is. */
export interface ComposerContextUsage {
	cachedInputTokens?: number;
	inputTokens?: number;
	outputTokens?: number;
	reasoningTokens?: number;
}

/** What each kind of token cost, in `currency`. Mizen ships no prices. */
export interface ComposerContextCost {
	cachedInput?: number;
	input?: number;
	output?: number;
	reasoning?: number;
}

export type ComposerContextMeterProps = Omit<
	Closed<ComponentPropsWithRef<"button">>,
	"children" | "data-slot" | "type"
> & {
	/** Shows each row's cost and the total at the foot of the card. */
	cost?: ComposerContextCost;
	/** An ISO 4217 code, such as "USD". */
	currency?: string;
	/** Formats token counts and costs. */
	locale?: string;
	/** The model's context window, in tokens. */
	maxTokens: number;
	/** Adds input, output, reasoning, and cached rows to the card. */
	usage?: ComposerContextUsage;
	/** Tokens in the context window now. */
	usedTokens: number;
};

const ROWS = [
	["Input", "inputTokens", "input"],
	["Output", "outputTokens", "output"],
	["Reasoning", "reasoningTokens", "reasoning"],
	["Cached", "cachedInputTokens", "cachedInput"],
] as const;

function formats(locale: string, currency: string) {
	const tokens = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 1,
		notation: "compact",
	});
	// Fractions of a cent stay visible: $0.0042, not $0.00.
	const money = (value: number) =>
		new Intl.NumberFormat(locale, {
			currency,
			maximumFractionDigits: Math.abs(value) < 0.01 ? 4 : 2,
			minimumFractionDigits: 2,
			style: "currency",
		}).format(value);
	return { money, tokens: (value: number) => tokens.format(value) };
}

type Formats = ReturnType<typeof formats>;

function Breakdown({
	cost,
	format,
	usage,
}: {
	cost: ComposerContextCost | undefined;
	format: Formats;
	usage: ComposerContextUsage;
}) {
	const rows = ROWS.filter(([, key]) => usage[key] !== undefined);
	return (
		<dl {...props(styles.contextRows)}>
			{rows.map(([label, key, costKey]) => {
				const price = cost?.[costKey];
				return (
					<div key={key} {...props(styles.contextRow)}>
						<dt {...props(styles.contextLabel)}>{label}</dt>
						<dd {...props(styles.contextValue)}>
							{format.tokens(usage[key] ?? 0)}
							{price === undefined ? null : (
								<span {...props(styles.contextCost)}>
									{" · "}
									{format.money(price)}
								</span>
							)}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}

function Total({
	cost,
	format,
}: {
	cost: ComposerContextCost | undefined;
	format: Formats;
}) {
	if (!cost) {
		return null;
	}
	const total = Object.values(cost).reduce((sum, value) => sum + value, 0);
	return (
		<div {...props(styles.contextRow, styles.contextTotal)}>
			<span>Total cost</span>
			<span {...props(styles.contextValue)}>{format.money(total)}</span>
		</div>
	);
}

/**
 * How full the model's context window is: a ring and "57% context" in the
 * status bar. Hovering or pressing it opens a card with the token counts,
 * a bar, and, when the app passes them, the breakdown and its cost.
 */
export function ComposerContextMeter({
	cost,
	currency = "USD",
	locale = "en",
	maxTokens,
	ref,
	usage,
	usedTokens,
	...rest
}: ComposerContextMeterProps) {
	if (!(Number.isFinite(usedTokens) && maxTokens > 0)) {
		throw new RangeError(
			"ComposerContextMeter needs a finite usedTokens and a positive maxTokens."
		);
	}
	const share = Math.min(Math.max(usedTokens / maxTokens, 0), 1);
	const percent = Math.round(share * 100);
	const format = formats(locale, currency);
	return (
		<Popover>
			<PopoverPrimitive.Trigger
				{...rest}
				closeDelay={100}
				data-slot="composer-context-meter"
				delay={150}
				openOnHover
				ref={ref}
				type="button"
				{...props(styles.statusItem, styles.meter)}
			>
				<ProgressRing share={share} />
				{/* A bare share could mean anything; the word says what fills up. */}
				{percent}% context
			</PopoverPrimitive.Trigger>
			<PopoverPopup align="end" side="top">
				<div {...props(typeRoles.ui, styles.contextCard)}>
					<div {...props(styles.contextRow)}>
						<span {...props(styles.contextTitle)}>Context</span>
						<span {...props(styles.contextValue)}>
							{format.tokens(usedTokens)} / {format.tokens(maxTokens)}
						</span>
					</div>
					<Progress aria-label="Context used" value={percent} />
					{usage ? (
						<Breakdown cost={cost} format={format} usage={usage} />
					) : null}
					<Total cost={cost} format={format} />
				</div>
			</PopoverPopup>
		</Popover>
	);
}
