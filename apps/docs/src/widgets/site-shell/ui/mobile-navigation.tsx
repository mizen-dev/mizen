"use client";

import {
	Button,
	Drawer,
	DrawerHeader,
	DrawerPanel,
	DrawerPopup,
	DrawerTitle,
	DrawerTrigger,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { type MouseEvent, useCallback, useState } from "react";
import { shellStyles } from "../../../shared/styles/docs-shell.styles";
import { ActiveComponentNavigation } from "./active-component-navigation";
import { SiteLinks } from "./site-links";

export function MobileNavigation({ docs = false }: { docs?: boolean }) {
	const [open, setOpen] = useState(false);
	const closeOnNavigate = useCallback((event: MouseEvent<HTMLDivElement>) => {
		if (event.target instanceof Element && event.target.closest("a[href]")) {
			setOpen(false);
		}
	}, []);
	return (
		<div {...props(shellStyles.mobileNav)} data-slot="mobile-navigation">
			<Drawer onOpenChange={setOpen} open={open} position="right">
				<DrawerTrigger
					render={
						<Button size="sm" variant="outline">
							Browse
						</Button>
					}
				/>
				<DrawerPopup
					closeProps={{ "aria-label": "Close navigation" }}
					onClick={closeOnNavigate}
					showCloseButton
				>
					<DrawerHeader>
						<DrawerTitle>{docs ? "Components" : "Navigation"}</DrawerTitle>
					</DrawerHeader>
					<DrawerPanel>
						<nav
							aria-label="Site navigation"
							{...props(shellStyles.mobileSiteLinks)}
						>
							<SiteLinks />
						</nav>
						{docs ? <ActiveComponentNavigation /> : null}
					</DrawerPanel>
				</DrawerPopup>
			</Drawer>
		</div>
	);
}
