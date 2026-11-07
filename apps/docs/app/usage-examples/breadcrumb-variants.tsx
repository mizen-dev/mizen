"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	Heading,
	Stack,
	Text,
} from "@mizen/ui";
import Link from "next/link";

export function BreadcrumbWorkspaceResourcesExample1() {
	return (
		<Stack gap="4">
			<Breadcrumb aria-label="Project location">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link href="/docs" />}>
							Components
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Navigation and progress</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Heading level={4}>Navigation and progress</Heading>
			<Text size="ui" tone="muted">
				Patterns for finding your place, moving through records, and completing
				a task.
			</Text>
		</Stack>
	);
}
