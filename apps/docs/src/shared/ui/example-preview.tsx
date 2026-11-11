"use client";

import { Button } from "@mizen-labs/ui/button";
import { Inline } from "@mizen-labs/ui/inline";
import {
	Tabs,
	TabsIndicator,
	TabsList,
	TabsPanel,
	TabsTab,
} from "@mizen-labs/ui/tabs";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function ExamplePreview({
	children,
	code,
	fullScreenHref,
	label,
}: {
	children: ReactNode;
	code: ReactNode;
	/** Where the example runs at the full width of the window. */
	fullScreenHref?: string;
	label: string;
}) {
	const tabs = (
		<TabsList aria-label={label} size="sm">
			<TabsTab value="preview">Preview</TabsTab>
			<TabsTab value="code">Code</TabsTab>
			<TabsIndicator />
		</TabsList>
	);
	return (
		<Tabs defaultValue="preview">
			{fullScreenHref ? (
				<Inline justify="between">
					{tabs}
					<Button
						nativeButton={false}
						render={
							<a href={fullScreenHref} rel="noreferrer" target="_blank" />
						}
						size="sm"
						variant="ghost"
					>
						Open full screen
						<IconArrowUpRight aria-hidden="true" size={16} />
					</Button>
				</Inline>
			) : (
				tabs
			)}
			<TabsPanel keepMounted value="preview">
				{children}
			</TabsPanel>
			<TabsPanel value="code">{code}</TabsPanel>
		</Tabs>
	);
}
