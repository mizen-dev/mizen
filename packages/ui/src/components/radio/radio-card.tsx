"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { props } from "@stylexjs/stylex";
import { type ReactNode, useId } from "react";
import { checkboxCardStyles } from "../checkbox/checkbox-card.styles";
import { Field, FieldDescription, FieldError } from "../field/field";
import { Radio, type RadioProps } from "./radio";

type RadioCardControlProps<Value> = Pick<
	RadioProps<Value>,
	"aria-describedby" | "id" | "inputRef" | "readOnly" | "required" | "value"
> & {
	disabled?: boolean;
	invalid?: boolean;
	ref?: RadioProps<Value>["ref"];
	size?: RadioProps<Value>["size"];
};

export type RadioCardProps<Value = unknown> = RadioCardControlProps<Value> & {
	description?: ReactNode;
	error?: ReactNode;
	label: ReactNode;
};

export function RadioCard<Value = unknown>({
	description,
	disabled = false,
	error,
	invalid = false,
	label,
	...radioProps
}: RadioCardProps<Value>) {
	const labelId = useId();

	return (
		<Field disabled={disabled} invalid={invalid}>
			<BaseField.Label {...props(checkboxCardStyles.label)}>
				<Radio
					{...radioProps}
					aria-labelledby={labelId}
					disabled={disabled}
					invalid={invalid}
				/>
				<span {...props(checkboxCardStyles.content)}>
					<span id={labelId}>{label}</span>
					{description !== undefined && description !== null ? (
						<FieldDescription render={<span />}>{description}</FieldDescription>
					) : null}
				</span>
			</BaseField.Label>
			{error !== undefined && error !== null ? (
				<FieldError match>{error}</FieldError>
			) : null}
		</Field>
	);
}
