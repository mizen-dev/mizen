import { Citation, Text } from "@mizen-labs/ui";

export function SourceMention() {
	return (
		<Text>
			Contrast and focus follow{" "}
			<Citation>Web Content Accessibility Guidelines 2.2</Citation>. Keyboard
			patterns come from the <Citation>ARIA Authoring Practices Guide</Citation>
			.
		</Text>
	);
}
