import { Heading } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { PreviewWorkspace } from "../../preview-workspace";

export function HeadingSpecimen() {
	return (
		<PreviewWorkspace title="Typography in a document">
			<div {...props(pageStyles.typographySpecimen)}>
				<Heading level={1} size="display">
					Display heading (h1)
				</Heading>
				<Heading level={2} size="title">
					Title heading (h2)
				</Heading>
				<Heading level={3} size="heading">
					Section heading (h3)
				</Heading>
				<Heading level={4}>Subsection heading (h4, default size)</Heading>
				<Heading level={5}>Minor heading (h5, default size)</Heading>
				<Heading level={6}>Detail heading (h6, default size)</Heading>
				<Heading>Default heading (default level 2, default size)</Heading>
			</div>
		</PreviewWorkspace>
	);
}
