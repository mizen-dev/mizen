import { Text, type TextProps } from "@mizen-labs/ui/text";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { PreviewWorkspace } from "../../preview-workspace";

const runtimeRoleProbeProps: TextProps & { readonly role: "status" } = {
	role: "status",
};

export function TextSpecimen() {
	return (
		<PreviewWorkspace title="Release notes">
			<div {...props(pageStyles.typographySpecimen)}>
				<Text {...runtimeRoleProbeProps}>
					Mizen helps teams compose interfaces with consistent tokens,
					accessible markup, and theme-driven styles.
				</Text>
				<Text size="body">
					Body text sets the primary reading size for cards, articles, dialog
					descriptions, and settings panels.
				</Text>
				<Text size="ui" tone="muted">
					Helper copy and supporting details remain readable in dense sidebars,
					table rows, and form fields.
				</Text>
				<Text size="caption">Updated 2 minutes ago by Sam.</Text>
				<Text>
					When an explanation runs long on small screens, the paragraph wraps
					naturally to maintain a comfortable reading flow and keep surrounding
					spacing tidy.
				</Text>
			</div>
		</PreviewWorkspace>
	);
}
