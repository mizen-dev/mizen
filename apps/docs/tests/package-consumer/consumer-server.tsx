import {
	Button,
	colors,
	Markdown,
	markdownComponents,
	Stack,
} from "@mizen-labs/ui";
import type { ButtonProps } from "@mizen-labs/ui/button";
import { Stack as StackSubpath } from "@mizen-labs/ui/stack";

export function StaticServerComposition() {
	const labeledIconButton: ButtonProps = {
		"aria-label": "Open report",
		children: "↗",
		size: "icon",
	};
	return (
		<Stack>
			<Markdown id="consumer-notes">
				<markdownComponents.h1>Packed consumer</markdownComponents.h1>
			</Markdown>
			<Button {...labeledIconButton} />
			<span data-token={colors.accent}>Brand accent token</span>
			<StackSubpath>
				<span>Root and subpath imports resolve in a server module.</span>
			</StackSubpath>
		</Stack>
	);
}

// @ts-expect-error Icon-sized buttons require an accessible name.
const _unlabeledIconButton: ButtonProps = { children: "↗", size: "icon" };
// @ts-expect-error Button omits consumer-owned class names.
const _openButton: ButtonProps = { children: "Open", className: "custom" };
