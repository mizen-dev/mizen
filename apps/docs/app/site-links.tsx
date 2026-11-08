"use client";

import { typographyStyles } from "@mizen-labs/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { Link, useLocation } from "@tanstack/react-router";
import { shellStyles } from "./docs-shell.styles";
import { siteSections } from "./site-sections";

export function SiteLinks() {
	const pathname = useLocation({ select: (location) => location.pathname });
	return siteSections.map(([label, href]) => {
		const active = pathname === href || pathname.startsWith(`${href}/`);
		return (
			<Link
				aria-current={active ? "page" : undefined}
				key={href}
				to={href}
				{...props(shellStyles.headerLink, active && shellStyles.navLinkCurrent)}
			>
				<span {...props(typographyStyles.controlLabel)}>{label}</span>
			</Link>
		);
	});
}
