"use client";

import {
	Button,
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
	Stack,
} from "@mizen/ui";
import { conditions } from "@mizen/ui/conditions.stylex";
import { duration, easing } from "@mizen/ui/motion.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";
import { IconChevronDown } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";

const styles = create({
	indicator: {
		flexShrink: 0,
		transform: {
			":is([data-panel-open] *)": "rotate(180deg)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.expoOut,
	},
	panel: { paddingInlineStart: space["3"] },
	// The ghost button's padding hangs outside, so its label aligns with content.
	root: { marginInlineStart: `calc(-1 * ${space["3"]})` },
});

/**
 * A docs-only disclosure for example controls. `forceOpen` opens it when the
 * example needs its controls visible; readers can still close it.
 */
export function DemoDisclosure({
	children,
	"data-testid": testId,
	forceOpen = false,
	id,
	title,
}: {
	children: ReactNode;
	"data-testid"?: string;
	forceOpen?: boolean;
	id?: string;
	title: string;
}) {
	const [open, setOpen] = useState(forceOpen);
	return (
		<div data-testid={testId} id={id} {...props(styles.root)}>
			<Collapsible onOpenChange={setOpen} open={forceOpen || open}>
				<CollapsibleTrigger render={<Button size="sm" variant="ghost" />}>
					{title}
					<IconChevronDown
						aria-hidden="true"
						size={16}
						{...props(styles.indicator)}
					/>
				</CollapsibleTrigger>
				<CollapsiblePanel>
					<div {...props(styles.panel)}>
						<Stack gap="3">{children}</Stack>
					</div>
				</CollapsiblePanel>
			</Collapsible>
		</div>
	);
}
