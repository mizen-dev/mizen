"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	ScrollArea,
} from "@mizen-labs/ui";
import { typographyStyles } from "@mizen-labs/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { IconSearch } from "@tabler/icons-react";
import { Link, useLoaderData, useLocation } from "@tanstack/react-router";
import { type ChangeEvent, useCallback, useState } from "react";
import { shellStyles } from "../../../shared/styles/docs-shell.styles";
import { ComponentNavigation } from "./component-navigation";
import { NavTreeGroup } from "./nav-tree";

export function ActiveComponentNavigation({
	aside = false,
}: {
	/** Desktop aside: search stays on top while the list scrolls. */
	aside?: boolean;
}) {
	const guides = useLoaderData({
		from: "__root__",
		select: (data) => data.guides,
	});
	const gettingStarted = guides.filter((guide) => guide.group === undefined);
	const hooks = guides.filter((guide) => guide.group === "Hooks");
	const pathname = useLocation({ select: (location) => location.pathname });
	const [query, setQuery] = useState("");
	const changeQuery = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setQuery(event.currentTarget.value),
		[]
	);
	const currentSlug = pathname.startsWith("/docs/components/")
		? pathname.split("/")[3]
		: undefined;

	const search = (
		<InputGroup>
			<InputGroupInput
				aria-label="Find a component"
				onChange={changeQuery}
				placeholder="Find a component…"
				size="sm"
				type="search"
				value={query}
			/>
			<InputGroupAddon align="inline-start">
				<IconSearch
					aria-hidden="true"
					size={16}
					{...props(shellStyles.sidebarSearchIcon)}
				/>
			</InputGroupAddon>
		</InputGroup>
	);
	const list = (
		<>
			<nav aria-label="Documentation guides" {...props(shellStyles.navGroup)}>
				<NavTreeGroup title="Getting started">
					{gettingStarted.map(({ slug, title }) => (
						<Link
							aria-current={pathname === `/docs/${slug}` ? "page" : undefined}
							key={slug}
							params={{ guide: slug }}
							to="/docs/$guide"
							{...props(
								shellStyles.navLink,
								pathname === `/docs/${slug}` && shellStyles.navLinkCurrent
							)}
						>
							<span {...props(typographyStyles.controlLabel)}>{title}</span>
						</Link>
					))}
				</NavTreeGroup>
				<NavTreeGroup title="Hooks">
					{hooks.map(({ slug, title }) => (
						<Link
							aria-current={pathname === `/docs/${slug}` ? "page" : undefined}
							key={slug}
							params={{ guide: slug }}
							to="/docs/$guide"
							{...props(
								shellStyles.navLink,
								pathname === `/docs/${slug}` && shellStyles.navLinkCurrent
							)}
						>
							<span {...props(typographyStyles.controlLabel)}>{title}</span>
						</Link>
					))}
				</NavTreeGroup>
			</nav>
			<ComponentNavigation currentSlug={currentSlug} query={query} />
		</>
	);

	if (!aside) {
		return (
			<>
				{search}
				<div {...props(shellStyles.navGroups)}>{list}</div>
			</>
		);
	}
	return (
		<>
			<div {...props(shellStyles.sidebarSearch)}>{search}</div>
			<ScrollArea fill overscrollContain scrollFade>
				<div {...props(shellStyles.sidebarList)}>{list}</div>
			</ScrollArea>
		</>
	);
}
