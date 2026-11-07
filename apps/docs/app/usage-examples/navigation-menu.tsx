import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuTrigger,
} from "@mizen/ui";
export function ProductNavigationMenu() {
	return (
		<NavigationMenu aria-label="Main navigation">
			<NavigationMenuList>
				<NavigationMenuItem value="product">
					<NavigationMenuTrigger>Product</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuLink
							description="Track usage and spot trends across teams."
							href="#analytics"
						>
							Analytics
						</NavigationMenuLink>
						<NavigationMenuLink
							description="Run routine work on a schedule or a trigger."
							href="#automations"
						>
							Automations
						</NavigationMenuLink>
						<NavigationMenuLink
							description="Connect GitHub, Slack, and Linear in minutes."
							href="#integrations"
						>
							Integrations
						</NavigationMenuLink>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem value="resources">
					<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuLink
							description="Guides and API reference for every feature."
							href="#docs"
						>
							Documentation
						</NavigationMenuLink>
						<NavigationMenuLink
							description="What shipped this week and what is next."
							href="#changelog"
						>
							Changelog
						</NavigationMenuLink>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuPopup />
		</NavigationMenu>
	);
}
