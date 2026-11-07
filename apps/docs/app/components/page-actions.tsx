"use client";

import {
	Button,
	ButtonGroup,
	Menu,
	MenuItem,
	MenuLinkItem,
	MenuPopup,
	MenuTrigger,
	useCopyToClipboard,
	VisuallyHidden,
} from "@mizen/ui";
import { IconCheck, IconChevronDown, IconCopy } from "@tabler/icons-react";
import { useCallback } from "react";

const assistants = [
	["ChatGPT", "https://chatgpt.com/?q="],
	["Claude", "https://claude.ai/new?q="],
] as const;

// Opens an assistant with a prompt to read this page's Markdown.
function AssistantItem({
	base,
	label,
	markdownPath,
	name,
}: {
	base: string;
	label: string;
	markdownPath: string;
	name: string;
}) {
	const open = useCallback(() => {
		const prompt = `Read ${window.location.origin}${markdownPath} so I can ask questions about Mizen's ${name} docs.`;
		window.open(`${base}${encodeURIComponent(prompt)}`, "_blank", "noopener");
	}, [base, markdownPath, name]);
	return <MenuItem onClick={open}>Open in {label}</MenuItem>;
}

// Copy the page as Markdown, or hand it to an assistant to read.
export function PageActions({
	markdownPath,
	name,
}: {
	markdownPath: string;
	name: string;
}) {
	const { copy, status } = useCopyToClipboard();
	const copyPage = useCallback(
		() => copy(fetch(markdownPath).then((response) => response.text())),
		[copy, markdownPath]
	);
	return (
		<>
			<ButtonGroup aria-label="Page actions">
				<Button onClick={copyPage} size="sm" variant="outline">
					{status === "copied" ? (
						<IconCheck aria-hidden="true" size={16} />
					) : (
						<IconCopy aria-hidden="true" size={16} />
					)}
					{status === "copied" ? "Copied" : "Copy page"}
				</Button>
				<Menu>
					<MenuTrigger
						render={
							<Button
								aria-label="More page actions"
								size="icon-sm"
								variant="outline"
							/>
						}
					>
						<IconChevronDown aria-hidden="true" size={16} />
					</MenuTrigger>
					<MenuPopup align="start">
						<MenuLinkItem href={markdownPath}>View as Markdown</MenuLinkItem>
						{assistants.map(([label, base]) => (
							<AssistantItem
								base={base}
								key={label}
								label={label}
								markdownPath={markdownPath}
								name={name}
							/>
						))}
					</MenuPopup>
				</Menu>
			</ButtonGroup>
			<span role="status">
				<VisuallyHidden>{status}</VisuallyHidden>
			</span>
		</>
	);
}
