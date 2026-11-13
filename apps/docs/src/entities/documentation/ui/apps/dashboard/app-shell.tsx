"use client";

import {
	Avatar,
	AvatarFallback,
	Button,
	Drawer,
	DrawerHeader,
	DrawerPanel,
	DrawerPopup,
	DrawerTitle,
	DrawerTrigger,
	Input,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import {
	type Icon,
	IconChartBar,
	IconHome,
	IconMenu2,
	IconPackage,
	IconSettings,
	IconShoppingCart,
	IconSpeakerphone,
	IconUsers,
	IconUsersGroup,
} from "@tabler/icons-react";
import { type MouseEvent, type ReactNode, useCallback, useState } from "react";
import { shellStyles } from "./app-shell.styles";

interface NavItem {
	count?: number;
	current?: boolean;
	href: string;
	icon: Icon;
	label: string;
}

// Each href is a place in this demo. In your app, render your router's link.
const primary: NavItem[] = [
	{ count: 12, current: true, href: "#home", icon: IconHome, label: "Home" },
	{ href: "#orders", icon: IconShoppingCart, label: "Orders" },
	{ href: "#customers", icon: IconUsers, label: "Customers" },
	{ href: "#products", icon: IconPackage, label: "Products" },
	{ href: "#analytics", icon: IconChartBar, label: "Analytics" },
	{ href: "#marketing", icon: IconSpeakerphone, label: "Marketing" },
];
const workspace: NavItem[] = [
	{ href: "#team", icon: IconUsersGroup, label: "Team" },
	{ href: "#settings", icon: IconSettings, label: "Settings" },
];

function NavList({ items, label }: { items: NavItem[]; label?: string }) {
	return (
		<ul aria-label={label} {...props(shellStyles.group)}>
			{label ? (
				<li aria-hidden="true" {...props(shellStyles.groupLabel)}>
					{label}
				</li>
			) : null}
			{items.map(({ count, current, href, icon: Glyph, label: name }) => (
				<li key={href}>
					<a
						aria-current={current ? "page" : undefined}
						href={href}
						{...props(shellStyles.link, current && shellStyles.linkCurrent)}
					>
						<Glyph aria-hidden="true" size={16} stroke={1.75} />
						<span {...props(shellStyles.linkLabel)}>{name}</span>
						{count ? <span {...props(shellStyles.count)}>{count}</span> : null}
					</a>
				</li>
			))}
		</ul>
	);
}

function Brand() {
	return (
		<div {...props(shellStyles.brand)}>
			<Avatar size="sm">
				<AvatarFallback>N</AvatarFallback>
			</Avatar>
			Northstar
		</div>
	);
}

// The sidebar and the drawer on a narrow screen show the same content.
function Navigation() {
	return (
		<>
			<Input
				aria-label="Search"
				name="search"
				placeholder="Search…"
				size="sm"
				type="search"
			/>
			<nav aria-label="Main" {...props(shellStyles.nav)}>
				<NavList items={primary} />
				<NavList items={workspace} label="Workspace" />
			</nav>
			<div {...props(shellStyles.account)}>
				<Avatar size="sm">
					<AvatarFallback>MC</AvatarFallback>
				</Avatar>
				<div>
					<Text size="ui">Maya Chen</Text>
					<Text size="caption" tone="muted">
						maya@northstar.io
					</Text>
				</div>
			</div>
		</>
	);
}

function NavigationDrawer() {
	const [open, setOpen] = useState(false);
	const closeOnNavigate = useCallback((event: MouseEvent<HTMLDivElement>) => {
		if (event.target instanceof Element && event.target.closest("a[href]")) {
			setOpen(false);
		}
	}, []);
	return (
		<Drawer onOpenChange={setOpen} open={open} position="left">
			<DrawerTrigger
				render={
					<Button aria-label="Open navigation" size="icon" variant="ghost">
						<IconMenu2 aria-hidden="true" />
					</Button>
				}
			/>
			<DrawerPopup
				closeProps={{ "aria-label": "Close navigation" }}
				onClick={closeOnNavigate}
				showCloseButton
			>
				<DrawerHeader>
					<DrawerTitle>Northstar</DrawerTitle>
				</DrawerHeader>
				<DrawerPanel>
					<div
						{...props(shellStyles.text, shellStyles.column, shellStyles.drawer)}
					>
						<Navigation />
					</div>
				</DrawerPanel>
			</DrawerPopup>
		</Drawer>
	);
}

// The frame around every screen. On a wide screen the navigation is a
// sidebar; on a narrow one it moves into a drawer behind the menu button.
export function AppShell({ children }: { children: ReactNode }) {
	return (
		<div {...props(shellStyles.shell)}>
			<header {...props(shellStyles.text, shellStyles.bar)}>
				<Brand />
				<NavigationDrawer />
			</header>
			<aside
				{...props(shellStyles.text, shellStyles.column, shellStyles.sidebar)}
			>
				<Brand />
				<Navigation />
			</aside>
			<main {...props(shellStyles.pane)}>{children}</main>
		</div>
	);
}
