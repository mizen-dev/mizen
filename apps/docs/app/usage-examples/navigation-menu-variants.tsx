import {
	Heading,
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
import Link from "next/link";

export function NavigationMenuWorkspaceResourcesExample1() {
	return (
		<Stack gap="4">
			<NavigationMenu aria-label="Site sections">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Components</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink render={<Link href="/components/button" />}>
								Button
							</NavigationMenuLink>
							<NavigationMenuLink render={<Link href="/components/input" />}>
								Input
							</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Guides</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink render={<Link href="/components/field" />}>
								Field
							</NavigationMenuLink>
							<NavigationMenuLink
								render={<Link href="/components/navigation-menu" />}
							>
								Navigation Menu
							</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink render={<Link href="/docs" />}>
							All components
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
				<NavigationMenuPopup />
			</NavigationMenu>
			<Heading level={4}>Build a calmer workspace</Heading>
			<Text size="ui" tone="muted">
				Start with a component, then combine it with familiar patterns for
				forms, navigation, and data.
			</Text>
		</Stack>
	);
}
