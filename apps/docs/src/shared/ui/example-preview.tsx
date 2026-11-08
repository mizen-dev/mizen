"use client";

import {
	Tabs,
	TabsIndicator,
	TabsList,
	TabsPanel,
	TabsTab,
} from "@mizen-labs/ui/tabs";
import type { ReactNode } from "react";

export function ExamplePreview({
	children,
	code,
	label,
}: {
	children: ReactNode;
	code: ReactNode;
	label: string;
}) {
	return (
		<Tabs defaultValue="preview">
			<TabsList aria-label={label} size="sm">
				<TabsTab value="preview">Preview</TabsTab>
				<TabsTab value="code">Code</TabsTab>
				<TabsIndicator />
			</TabsList>
			<TabsPanel keepMounted value="preview">
				{children}
			</TabsPanel>
			<TabsPanel value="code">{code}</TabsPanel>
		</Tabs>
	);
}
