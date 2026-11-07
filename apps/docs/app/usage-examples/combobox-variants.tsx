"use client";

import {
	Button,
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxGroupLabel,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxSeparator,
	ComboboxTrigger,
	ComboboxValue,
	createComboboxItems,
	Field,
	FieldError,
	FieldLabel,
	SelectButton,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";
import { IconSearch, IconSelector } from "@tabler/icons-react";
import { type FormEvent, Fragment, useCallback, useState } from "react";
import { specimenStyles } from "../components/[slug]/specimens/form-specimen.styles";

const exampleStyles = create({ popupSearch: { padding: space["3"] } });

const frameworks = [
	"React",
	"Next.js",
	"Vue",
	"Nuxt",
	"Svelte",
	"Astro",
	"Solid",
];

function FrameworkOptions() {
	return (
		<>
			<ComboboxEmpty>No frameworks found.</ComboboxEmpty>
			<ComboboxList>
				{(framework: string) => (
					<ComboboxItem key={framework} value={framework}>
						{framework}
					</ComboboxItem>
				)}
			</ComboboxList>
		</>
	);
}

export function ComboboxDisabled() {
	return (
		<Combobox defaultValue="React" disabled items={frameworks}>
			<ComboboxInput aria-label="Disabled framework" />
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxSmall() {
	return (
		<Combobox items={frameworks}>
			<ComboboxInput
				aria-label="Small framework"
				placeholder="Choose a framework…"
				size="sm"
			/>
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxLarge() {
	return (
		<Combobox items={frameworks}>
			<ComboboxInput
				aria-label="Large framework"
				placeholder="Choose a framework…"
				size="lg"
			/>
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxAutoHighlight() {
	return (
		<Combobox autoHighlight items={frameworks}>
			<ComboboxInput
				aria-label="Auto highlight framework"
				placeholder="Search frameworks…"
			/>
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxClearExample() {
	return (
		<Combobox defaultValue="React" items={frameworks}>
			<ComboboxInput aria-label="Clearable framework" showClear />
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxStartAddon() {
	return (
		<Combobox items={frameworks}>
			<ComboboxInput
				aria-label="Search frameworks with icon"
				placeholder="Search frameworks…"
				startAddon={<IconSearch aria-hidden="true" size={16} />}
			/>
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxMultipleAddon() {
	return (
		<Combobox defaultValue={["React"]} items={frameworks} multiple>
			<ComboboxChips startAddon={<IconSearch aria-hidden="true" size={16} />}>
				<ComboboxValue>
					{(values: string[]) =>
						values.map((value) => (
							<ComboboxChip
								key={value}
								removeProps={{ "aria-label": `Remove ${value}` }}
							>
								{value}
							</ComboboxChip>
						))
					}
				</ComboboxValue>
				<ComboboxChipsInput
					aria-label="Search multiple frameworks"
					placeholder="Add framework…"
				/>
			</ComboboxChips>
			<ComboboxPopup>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}

const groupedFrameworks = [
	{ items: ["React", "Next.js"], label: "React" },
	{ items: ["Vue", "Nuxt"], label: "Vue" },
	{ items: ["Svelte", "Astro", "Solid"], label: "Other" },
];
export function ComboboxGroups() {
	return (
		<Combobox items={groupedFrameworks}>
			<ComboboxInput
				aria-label="Grouped frameworks"
				placeholder="Search frameworks…"
			/>
			<ComboboxPopup>
				<ComboboxEmpty>No frameworks found.</ComboboxEmpty>
				<ComboboxList>
					{(group: (typeof groupedFrameworks)[number], index: number) => (
						<Fragment key={group.label}>
							<ComboboxGroup items={group.items}>
								<ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
								<ComboboxCollection>
									{(framework: string) => (
										<ComboboxItem key={framework} value={framework}>
											{framework}
										</ComboboxItem>
									)}
								</ComboboxCollection>
							</ComboboxGroup>
							{index < groupedFrameworks.length - 1 && <ComboboxSeparator />}
						</Fragment>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

export function ComboboxPopupInput() {
	return (
		<Combobox defaultValue="React" items={frameworks}>
			<ComboboxTrigger
				aria-label="Choose framework in popup"
				render={<Button variant="outline" />}
			>
				<ComboboxValue />
				<IconSelector aria-hidden="true" size={16} />
			</ComboboxTrigger>
			<ComboboxPopup aria-label="Framework options">
				<div {...props(exampleStyles.popupSearch)}>
					<ComboboxInput
						aria-label="Search inside popup"
						placeholder="Search frameworks…"
						showTrigger={false}
						startAddon={<IconSearch aria-hidden="true" size={16} />}
					/>
				</div>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}
export function ComboboxSelectButtonExample() {
	return (
		<Combobox items={frameworks}>
			<ComboboxTrigger
				aria-label="Select-like framework"
				render={<SelectButton />}
			>
				<ComboboxValue placeholder="Choose a framework" />
			</ComboboxTrigger>
			<ComboboxPopup aria-label="Framework options">
				<div {...props(exampleStyles.popupSearch)}>
					<ComboboxInput
						aria-label="Search select options"
						placeholder="Search frameworks…"
						showTrigger={false}
					/>
				</div>
				<FrameworkOptions />
			</ComboboxPopup>
		</Combobox>
	);
}

const people = [
	{ id: "maya", name: "Maya Chen" },
	{ id: "alex", name: "Alex Morgan" },
	{ id: "sam", name: "Sam Rivera" },
];
const personItems = createComboboxItems(people, {
	getLabel: (person) => person.name,
	getValue: (person) => person.id,
});
export function ComboboxPrimitiveValues() {
	return (
		<Combobox defaultValue="maya" items={personItems}>
			<ComboboxInput aria-label="Project owner" />
			<ComboboxPopup>
				<ComboboxEmpty>No people found.</ComboboxEmpty>
				<ComboboxList>
					{(person: (typeof people)[number]) => (
						<ComboboxItem key={person.id} value={person.id}>
							{person.name}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

export function ComboboxFormSingle() {
	const [result, setResult] = useState<string>();
	const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setResult(String(new FormData(event.currentTarget).get("framework")));
	}, []);
	return (
		<form onSubmit={submit} {...props(specimenStyles.form)}>
			<Stack gap="3">
				<Field name="framework">
					<FieldLabel>Project framework</FieldLabel>
					<Combobox items={frameworks} name="framework" required>
						<ComboboxInput placeholder="Choose a framework…" />
						<ComboboxPopup>
							<FrameworkOptions />
						</ComboboxPopup>
					</Combobox>
					<FieldError>Select a framework.</FieldError>
				</Field>
				<div {...props(specimenStyles.submit)}>
					<Button type="submit">Save framework</Button>
				</div>
				{Boolean(result) && <Text aria-live="polite">Saved: {result}</Text>}
			</Stack>
		</form>
	);
}
export function ComboboxFormMultiple() {
	const [result, setResult] = useState<string>();
	const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setResult(
			new FormData(event.currentTarget).getAll("frameworks").join(", ")
		);
	}, []);
	return (
		<form onSubmit={submit} {...props(specimenStyles.form)}>
			<Stack gap="3">
				<Field name="frameworks">
					<FieldLabel>Supported frameworks</FieldLabel>
					<Combobox items={frameworks} multiple name="frameworks" required>
						<ComboboxChips>
							<ComboboxValue>
								{(values: string[]) =>
									values.map((value) => (
										<ComboboxChip
											key={value}
											removeProps={{ "aria-label": `Remove ${value}` }}
										>
											{value}
										</ComboboxChip>
									))
								}
							</ComboboxValue>
							<ComboboxChipsInput placeholder="Add framework…" />
						</ComboboxChips>
						<ComboboxPopup>
							<FrameworkOptions />
						</ComboboxPopup>
					</Combobox>
					<FieldError>Select at least one framework.</FieldError>
				</Field>
				<div {...props(specimenStyles.submit)}>
					<Button type="submit">Save frameworks</Button>
				</div>
				{Boolean(result) && <Text aria-live="polite">Saved: {result}</Text>}
			</Stack>
		</form>
	);
}
