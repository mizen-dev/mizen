import { Button, Group, Spacer, Stack, Text, VisuallyHidden } from "@mizen/ui";
import { IconDownload, IconShare, IconTrash } from "@tabler/icons-react";

const files = ["Q3 report.pdf", "Brand guidelines.pdf", "Launch plan.docx"];

const actions = [
	[IconDownload, "Download"],
	[IconShare, "Share"],
	[IconTrash, "Delete"],
] as const;

export function NamedIconAction() {
	return (
		<Stack gap="2">
			{files.map((file) => (
				<Group key={file}>
					<Text size="ui">{file}</Text>
					<Spacer />
					{actions.map(([Icon, verb]) => {
						const labelId = `${file}-${verb}`.replace(/\W+/g, "-");
						return (
							<Button
								aria-labelledby={labelId}
								key={verb}
								size="icon-sm"
								variant="ghost"
							>
								<Icon aria-hidden="true" size={16} />
								<VisuallyHidden id={labelId}>
									{verb} {file}
								</VisuallyHidden>
							</Button>
						);
					})}
				</Group>
			))}
		</Stack>
	);
}
