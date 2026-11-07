"use client";

import {
	Button,
	Popover,
	PopoverPopup,
	PopoverTitle,
	PopoverTrigger,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { type MouseEvent, useCallback, useState } from "react";
import { ActiveComponentNavigation } from "./active-component-navigation";
import { shellStyles } from "./docs-shell.styles";
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
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger
					render={
						<Button size="sm" variant="outline">
							Browse
						</Button>
					}
				/>
				<PopoverPopup align="end" onClick={closeOnNavigate} sideOffset={6}>
					<div {...props(shellStyles.mobilePanel)}>
						<PopoverTitle>{docs ? "Components" : "Navigation"}</PopoverTitle>
						<nav
							aria-label="Site navigation"
							{...props(shellStyles.mobileSiteLinks)}
						>
							<SiteLinks />
						</nav>
						{docs ? <ActiveComponentNavigation /> : null}
					</div>
				</PopoverPopup>
			</Popover>
		</div>
	);
}
