import { Heading, Stack } from "@mizen/ui";

export function ArticleHeadings() {
	return (
		<Stack gap="3">
			<Heading level={2} size="title">
				Deployment guide
			</Heading>
			<Heading level={3}>Before you start</Heading>
			<Heading level={3}>Run the deploy</Heading>
		</Stack>
	);
}
