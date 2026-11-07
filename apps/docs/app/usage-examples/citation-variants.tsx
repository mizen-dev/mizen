import { Citation, Stack, Text } from "@mizen/ui";

export function CitationSourceTitlesExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Text>
					The composition rules in <Citation>Mizen UI architecture</Citation>{" "}
					keep routine styling decisions inside the library.
				</Text>
			</Stack>
		</Stack>
	);
}
