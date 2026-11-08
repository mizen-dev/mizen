"use client";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxValue,
	Field,
	FieldLabel,
	Stack,
} from "@mizen-labs/ui";

const frameworks = [
	"React",
	"Next.js",
	"Vue",
	"Nuxt",
	"Svelte",
	"Astro",
	"Solid",
];
const tags = [
	"Design",
	"Engineering",
	"Product",
	"Marketing",
	"Research",
	"Support",
];
export function FrameworkCombobox() {
	return (
		<Field>
			<FieldLabel>Framework</FieldLabel>
			<Combobox items={frameworks}>
				<ComboboxInput placeholder="Search frameworks…" showClear />
				<ComboboxPopup>
					<ComboboxEmpty>No frameworks found.</ComboboxEmpty>
					<ComboboxList>
						<ComboboxCollection>
							{(framework: string) => (
								<ComboboxItem key={framework} value={framework}>
									{framework}
								</ComboboxItem>
							)}
						</ComboboxCollection>
					</ComboboxList>
				</ComboboxPopup>
			</Combobox>
		</Field>
	);
}
export function KeyboardAccessibleCombobox() {
	return (
		<Stack gap="4">
			<Field>
				<FieldLabel>Tab-accessible actions</FieldLabel>
				<Combobox defaultValue="React" items={frameworks}>
					<ComboboxInput
						clearProps={{ tabIndex: 0 }}
						placeholder="Select framework with Tab"
						showClear
						triggerProps={{ tabIndex: 0 }}
					/>
					<ComboboxPopup>
						<ComboboxEmpty>No frameworks found.</ComboboxEmpty>
						<ComboboxList>
							<ComboboxCollection>
								{(framework: string) => (
									<ComboboxItem key={framework} value={framework}>
										{framework}
									</ComboboxItem>
								)}
							</ComboboxCollection>
						</ComboboxList>
					</ComboboxPopup>
				</Combobox>
			</Field>
		</Stack>
	);
}
export function MultipleCombobox() {
	return (
		<Stack gap="4">
			<Field>
				<FieldLabel>Team tags</FieldLabel>
				<Combobox
					defaultValue={["Design", "Engineering"]}
					items={tags}
					multiple
				>
					<ComboboxChips>
						<ComboboxValue>
							{(values: string[]) =>
								values.map((tag) => (
									<ComboboxChip key={tag}>{tag}</ComboboxChip>
								))
							}
						</ComboboxValue>
						<ComboboxChipsInput placeholder="Add tag..." size="sm" />
					</ComboboxChips>
					<ComboboxPopup>
						<ComboboxEmpty>No tags found.</ComboboxEmpty>
						<ComboboxList>
							<ComboboxCollection>
								{(tag: string) => (
									<ComboboxItem key={tag} value={tag}>
										{tag}
									</ComboboxItem>
								)}
							</ComboboxCollection>
						</ComboboxList>
					</ComboboxPopup>
				</Combobox>
			</Field>
		</Stack>
	);
}
export function ComboboxManagedFramework() {
	return (
		<Field disabled>
			<FieldLabel>Managed framework</FieldLabel>
			<Combobox defaultValue="React" items={frameworks}>
				<ComboboxInput readOnly showTrigger={false} />
			</Combobox>
		</Field>
	);
}
export function ComboboxReadonlyFramework() {
	return (
		<Field>
			<FieldLabel>Read-only framework</FieldLabel>
			<Combobox defaultValue="React" items={frameworks} readOnly>
				<ComboboxInput showTrigger={false} />
			</Combobox>
		</Field>
	);
}
export function ComboboxRequiredFramework() {
	return (
		<Field invalid>
			<FieldLabel>Required framework</FieldLabel>
			<Combobox items={frameworks}>
				<ComboboxInput
					aria-invalid="true"
					placeholder="Choose framework"
					showTrigger={false}
				/>
			</Combobox>
		</Field>
	);
}
