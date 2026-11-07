import { Heading, Stack, Text } from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { previewWorkspaceStyles } from "./preview-workspace.styles";

export function PreviewCanvas({ children }: { children: ReactNode }) {
	return <div {...props(previewWorkspaceStyles.canvas)}>{children}</div>;
}

export function PreviewWorkspace({
	title,
	description,
	children,
	canvas = true,
	titleId,
	testId,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	canvas?: boolean;
	titleId?: string;
	testId?: string;
}) {
	return (
		<section
			aria-label={title}
			data-testid={testId}
			{...props(previewWorkspaceStyles.workarea)}
		>
			<Stack gap="1">
				<Heading id={titleId} level={3}>
					{title}
				</Heading>
				{description ? (
					<Text size="ui" tone="muted">
						{description}
					</Text>
				) : null}
			</Stack>
			{canvas ? (
				<PreviewCanvas>{children}</PreviewCanvas>
			) : (
				<Stack gap="4">{children}</Stack>
			)}
		</section>
	);
}
