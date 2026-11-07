"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { props } from "@stylexjs/stylex";
import { type ReactNode, useId } from "react";
import { Field, FieldDescription, FieldError } from "../field/field";
import { Checkbox, type CheckboxProps } from "./checkbox";
import { checkboxCardStyles } from "./checkbox-card.styles";

type CheckboxCardControlProps = Pick<
	CheckboxProps,
	| "aria-describedby"
	| "checked"
	| "defaultChecked"
	| "form"
	| "id"
	| "indeterminate"
	| "inputRef"
	| "onCheckedChange"
	| "readOnly"
	| "required"
	| "value"
	| "uncheckedValue"
> & {
	disabled?: boolean;
	invalid?: boolean;
	name?: CheckboxProps["name"];
	ref?: CheckboxProps["ref"];
	size?: CheckboxProps["size"];
};

export type CheckboxCardProps = CheckboxCardControlProps & {
	description?: ReactNode;
	error?: ReactNode;
	label: ReactNode;
};

export function CheckboxCard({
	description,
	disabled = false,
	error,
	invalid = false,
	label,
	name,
	...checkboxProps
}: CheckboxCardProps) {
	const labelId = useId();

	return (
		<Field disabled={disabled} invalid={invalid} name={name}>
			<BaseField.Label {...props(checkboxCardStyles.label)}>
				<Checkbox
					{...checkboxProps}
					aria-labelledby={labelId}
					disabled={disabled}
					invalid={invalid}
					name={name}
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
