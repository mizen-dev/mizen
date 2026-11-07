"use client";
import {
	Combobox,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
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
export function ComboboxSpecimen() {
	return (
		<Combobox items={frameworks}>
			<ComboboxInput
				aria-label="Framework"
				placeholder="Select or search framework..."
				showClear
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
	);
}
