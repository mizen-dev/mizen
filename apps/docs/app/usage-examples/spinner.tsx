import { Inline, Spinner, Text } from "@mizen/ui";

export function SyncStatus() {
	return (
		<Inline>
			{/* The text says what is happening, so the spinner is decorative. */}
			<Spinner aria-hidden="true" />
			<Text>Synchronizing workspace</Text>
		</Inline>
	);
}
