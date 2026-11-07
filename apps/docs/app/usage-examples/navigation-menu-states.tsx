"use client";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuTrigger,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { IconBook, IconFileText } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useState } from "react";

const guides = [
	"button",
	"input",
	"checkbox",
	"radio-group",
	"slider",
	"switch",
	"combobox",
	"menu",
	"dialog",
	"drawer",
	"popover",
	"tooltip",
	"breadcrumb",
	"navigation-menu",
];

export function NavigationMenuStates() {
	const [value, setValue] = useState<string | null>(null);
	const changePanel = useCallback(
		(next: unknown) => setValue(typeof next === "string" ? next : null),
		[]
	);
	return (
		<Stack gap="2">
			<NavigationMenu
				aria-label="Resource navigation"
				onValueChange={changePanel}
				value={value}
			>
				<NavigationMenuList>
					<NavigationMenuItem value="resources">
						<NavigationMenuTrigger>
							<IconBook aria-hidden="true" />
							Resources
						</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink
								render={<Link href="/docs/components/button" />}
							>
								<IconFileText aria-hidden="true" />
								Button guide
							</NavigationMenuLink>
							<NavigationMenuLink href="/docs/components/input">
								Input guide
							</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem value="guides">
						<NavigationMenuTrigger>All guides</NavigationMenuTrigger>
						<NavigationMenuContent>
							{guides.map((slug) => (
								<NavigationMenuLink
									href={`/docs/components/${slug}`}
									key={slug}
								>
									{slug}
								</NavigationMenuLink>
							))}
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem value="support">
						<NavigationMenuTrigger disabled>Support</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink href="/docs">
								Support documentation
							</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink active href="/docs/components/navigation-menu">
							Current section
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
				<NavigationMenuPopup />
			</NavigationMenu>
			<Text aria-live="polite" size="ui" tone="muted">
				Panel: {value ?? "closed"}
			</Text>
		</Stack>
	);
}
