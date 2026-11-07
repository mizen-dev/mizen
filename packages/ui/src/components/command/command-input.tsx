"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { IconSearch } from "../../icons";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import type { CommandInputProps } from "./command.types";
import { commandFieldStyles } from "./command-field.styles";

function SearchIcon(): ReactElement {
	return <IconSearch aria-hidden="true" focusable="false" size="16" />;
}

export function CommandInput({
	autoFocus = true,
	disabled = false,
	placeholder,
	readOnly = false,
	ref: forwardedRef = undefined,
	render,
	startAddon,
	...rest
}: CommandInputProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<div
			data-slot="command-input-wrapper"
			{...props(commandFieldStyles.inputWrapper)}
		>
			<BaseAutocomplete.InputGroup
				data-slot="command-input-group"
				{...props(commandFieldStyles.inputGroup)}
			>
				<div
					aria-hidden="true"
					data-slot="command-start-addon"
					{...props(commandFieldStyles.startAddon)}
				>
					{startAddon ?? <SearchIcon />}
				</div>
				<BaseAutocomplete.Input
					{...rest}
					autoFocus={autoFocus}
					data-slot="command-input"
					disabled={disabled}
					placeholder={placeholder}
					readOnly={readOnly}
					ref={forwardedRef}
					render={protectSlot("command-input", render)}
					{...props(commandFieldStyles.input)}
				/>
			</BaseAutocomplete.InputGroup>
		</div>
	);
}
