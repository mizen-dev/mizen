"use client";

import {
	Button,
	PreviewCard,
	PreviewCardPopup,
	PreviewCardTrigger,
	Stack,
	Text,
} from "@mizen/ui";
import { useCallback, useState } from "react";

export function PreviewCardControlled() {
	const [open, setOpen] = useState(false);
	const toggle = useCallback(() => setOpen((current) => !current), []);
	return (
		<Stack gap="4">
			<Button onClick={toggle} variant="outline">
				{open ? "Hide preview" : "Show preview"}
			</Button>
			<PreviewCard onOpenChange={setOpen} open={open}>
				<PreviewCardTrigger
					closeDelay={0}
					delay={0}
					href="/docs/components/preview-card"
				>
					Preview Card documentation
				</PreviewCardTrigger>
				<PreviewCardPopup
					portalProps={{ keepMounted: true }}
					render={<article />}
				>
					<Text size="ui" tone="muted">
						A supplementary card rendered as a custom element.
					</Text>
				</PreviewCardPopup>
			</PreviewCard>
		</Stack>
	);
}

export function PreviewCardDelays() {
	return (
		<PreviewCard>
			<PreviewCardTrigger
				closeDelay={300}
				delay={600}
				href="/docs/components/preview-card"
			>
				Hover to preview
			</PreviewCardTrigger>
			<PreviewCardPopup>
				<Text size="ui" tone="muted">
					Opens after 600 milliseconds. Stays open while the pointer moves into
					the card.
				</Text>
			</PreviewCardPopup>
		</PreviewCard>
	);
}
