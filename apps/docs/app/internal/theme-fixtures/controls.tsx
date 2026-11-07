"use client";
import {
	darkTheme,
	Field,
	FieldLabel,
	Input,
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Stack,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { useState } from "react";
import { pageStyles } from "../../page.styles";

export function LocallyThemedField() {
	return (
		<Stack gap="4">
			<div {...props(darkTheme as never, pageStyles.darkFieldPanel as never)}>
				<Field>
					<FieldLabel>Dark field</FieldLabel>
					<Input placeholder="Dark value" />
				</Field>
			</div>
		</Stack>
	);
}

export function LocallyThemedSelect() {
	const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
		null
	);
	return (
		<Stack gap="4">
			<div
				data-testid="select-local-dark-scope"
				ref={setPortalContainer}
				{...props(darkTheme as never, pageStyles.themePanel as never)}
			>
				<Select>
					<SelectTrigger aria-label="Locally themed workspace">
						<SelectValue placeholder="Choose an environment" />
					</SelectTrigger>
					<SelectPopup container={portalContainer}>
						<SelectItem value="production">Production</SelectItem>
						<SelectItem value="staging">Staging</SelectItem>
					</SelectPopup>
				</Select>
			</div>
		</Stack>
	);
}
