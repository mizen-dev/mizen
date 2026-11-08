import { Heading, Stack, Text } from "@mizen-labs/ui";
import type { ReactNode } from "react";
import {
	PreviewCanvas,
	PreviewWorkspace,
} from "../../../../shared/ui/preview-workspace";

export function SpecimenSection({
	title,
	description,
	children,
	primary = false,
	canvas = true,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	primary?: boolean;
	canvas?: boolean;
}) {
	if (primary) {
		return (
			<PreviewWorkspace canvas={canvas} description={description} title={title}>
				{children}
			</PreviewWorkspace>
		);
	}
	return (
		<section aria-label={title}>
			<Stack gap="4">
				<Stack gap="1">
					<Heading level={3}>{title}</Heading>
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
			</Stack>
		</section>
	);
}
