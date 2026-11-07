"use client";

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	Button,
	Menu,
	MenuItem,
	MenuPopup,
	MenuTrigger,
} from "@mizen-labs/ui";
import { IconFileText, IconFolder, IconHome } from "@tabler/icons-react";
import Link from "next/link";

export function BreadcrumbWithIcons() {
	return (
		<Breadcrumb aria-label="Icon trail">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink render={<Link href="/" />}>
						<IconHome aria-hidden="true" />
						Home
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="/docs">
						<IconFolder aria-hidden="true" />
						Docs
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>
						<IconFileText aria-hidden="true" />
						Breadcrumb
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export function BreadcrumbCollapsed() {
	return (
		<Breadcrumb aria-label="Collapsed trail">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<Menu>
						<MenuTrigger
							render={
								<Button
									aria-label="Show ancestors"
									size="icon-xs"
									variant="ghost"
								/>
							}
						>
							<BreadcrumbEllipsis />
						</MenuTrigger>
						<MenuPopup align="start">
							<MenuItem render={<Link href="/docs" />}>Documentation</MenuItem>
							<MenuItem render={<Link href="/docs/components" />}>
								Components
							</MenuItem>
						</MenuPopup>
					</Menu>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export function BreadcrumbCustomSeparator() {
	return (
		<Breadcrumb aria-label="Custom separator trail">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>/</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>/</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export function BreadcrumbLongLabels() {
	return (
		<Breadcrumb aria-label="Long resource trail">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>
						workspace_permissions_production_europe_west_revision_1842
					</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
