import { Inline, Stack, Text, Thumbnail } from "@mizen/ui";
import { richContentImage } from "../compositions/rich-content-source";

export function ThumbnailDesignAssetsExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Inline>
					<Stack gap="1">
						<Text>Small · 2rem</Text>
						<Thumbnail {...richContentImage} size="sm" />
					</Stack>
					<Stack gap="1">
						<Text>Default · 3rem</Text>
						<Thumbnail {...richContentImage} />
					</Stack>
					<Stack gap="1">
						<Text>Large · 4rem</Text>
						<Thumbnail {...richContentImage} size="lg" />
					</Stack>
				</Inline>
			</Stack>
		</Stack>
	);
}
