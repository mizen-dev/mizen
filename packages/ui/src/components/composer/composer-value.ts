import type { ReactNode } from "react";

/** Data retained when a suggestion becomes part of the draft. */
interface TokenData {
	data?: string;
	id: string;
	kind?: string;
	label: string;
	text?: string;
}
type TokenKind = "mention" | "action";

/** Inserted tokens have a concrete kind and the trigger that produced them. */
export type ComposerTokenPart = TokenData & {
	trigger: string;
	type: TokenKind;
};
export type ComposerPart = ComposerTokenPart | { text: string; type: "text" };
export type ComposerValue = readonly ComposerPart[];

/** Suggestions add display and availability metadata to the insertion data. */
export interface ComposerItemValue extends TokenData {
	description?: string;
	disabled?: boolean;
	icon?: ReactNode;
	type?: TokenKind;
}

/** A query identifies the trigger, current search text, and request identity. */
export interface ComposerQuery {
	character: string;
	key: string;
	text: string;
}
export type ComposerTriggerState = "ready" | "loading" | "error";

/** Sources provide items synchronously; itemsFor identifies an async response. */
export interface ComposerTrigger extends Pick<ComposerQuery, "character"> {
	filter?: ((item: ComposerItemValue, query: string) => boolean) | null;
	items: readonly ComposerItemValue[];
	itemsFor?: string;
	maxQueryLength?: number;
	queryKey?: string;
	showEmpty?: boolean;
	status?: ComposerTriggerState;
}
