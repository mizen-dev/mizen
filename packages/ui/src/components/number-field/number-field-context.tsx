import type { ReactElement } from "react";
import { createContext, useContext } from "react";
import {
	IconArrowsHorizontal,
	IconArrowsVertical,
	IconMinus,
	IconPlus,
} from "../../icons";
import type { BoundNumberField } from "../field/field-context";
import type { NumberFieldSize } from "./number-field.types";

export interface NumberFieldContextValue {
	readonly boundField: BoundNumberField | null;
	readonly inputId: string;
	readonly scrubLabelId: string;
	readonly size: NumberFieldSize;
}

export const NumberFieldContext = createContext<NumberFieldContextValue>({
	boundField: null,
	inputId: "",
	scrubLabelId: "",
	size: "default",
});

export function useNumberFieldContext(): NumberFieldContextValue {
	return useContext(NumberFieldContext);
}

export function MinusIcon(): ReactElement {
	return <IconMinus aria-hidden="true" focusable="false" size="16" />;
}

export function PlusIcon(): ReactElement {
	return <IconPlus aria-hidden="true" focusable="false" size="16" />;
}

export function CursorHorizontalIcon(): ReactElement {
	return (
		<IconArrowsHorizontal aria-hidden="true" focusable="false" size="16" />
	);
}

export function CursorVerticalIcon(): ReactElement {
	return <IconArrowsVertical aria-hidden="true" focusable="false" size="16" />;
}
