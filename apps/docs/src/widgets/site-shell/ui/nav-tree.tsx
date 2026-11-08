"use client";

import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import type { Icon } from "@tabler/icons-react";
import {
	IconBell,
	IconBook,
	IconChartBar,
	IconChevronRight,
	IconCode,
	IconCompass,
	IconForms,
	IconLayout,
	IconPhoto,
	IconPointer,
	IconSparkles,
	IconStack2,
	IconTable,
	IconTypography,
} from "@tabler/icons-react";
import { type ReactNode, useState } from "react";
import { shellStyles } from "../../../shared/styles/docs-shell.styles";

const groupIcons: Record<string, Icon> = {
	Actions: IconPointer,
	Agentic: IconSparkles,
	Charts: IconChartBar,
	Content: IconPhoto,
	Data: IconTable,
	Feedback: IconBell,
	Forms: IconForms,
	"Getting started": IconBook,
	Hooks: IconCode,
	Layout: IconLayout,
	Navigation: IconCompass,
	Overlays: IconStack2,
	Typography: IconTypography,
};

// One aside group: an icon header that folds its items away. Groups start
// open; a search keeps every matching group open.
export function NavTreeGroup({
	children,
	forceOpen = false,
	title,
}: {
	children: ReactNode;
	forceOpen?: boolean;
	title: string;
}) {
	const [open, setOpen] = useState(true);
	const GroupIcon = groupIcons[title] ?? IconBook;
	return (
		<Collapsible
			onOpenChange={setOpen}
			open={forceOpen || open}
			render={<section />}
		>
			{/* Accordion pattern: the heading keeps groups navigable by heading. */}
			<h2 {...props(shellStyles.navTreeHeading)}>
				<CollapsibleTrigger
					render={
						<button type="button" {...props(shellStyles.navTreeTrigger)} />
					}
				>
					<GroupIcon
						aria-hidden="true"
						size={16}
						{...props(shellStyles.navTreeIcon)}
					/>
					<span>{title}</span>
					<IconChevronRight
						aria-hidden="true"
						size={14}
						{...props(shellStyles.navTreeChevron)}
					/>
				</CollapsibleTrigger>
			</h2>
			<CollapsiblePanel>
				<div {...props(shellStyles.navGroupList)}>{children}</div>
			</CollapsiblePanel>
		</Collapsible>
	);
}
