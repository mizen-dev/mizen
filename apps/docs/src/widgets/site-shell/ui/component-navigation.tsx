"use client";

import { typographyStyles } from "@mizen-labs/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { Link, useLoaderData } from "@tanstack/react-router";
import { shellStyles } from "../../../shared/styles/docs-shell.styles";
import { NavTreeGroup } from "./nav-tree";

export function ComponentNavigation({
	currentSlug,
	query = "",
}: {
	currentSlug?: string;
	query?: string;
}) {
	const groupedComponentDocs = useLoaderData({
		from: "__root__",
		select: (data) => data.componentGroups,
	});
	const search = query.trim().toLowerCase();
	const groups = groupedComponentDocs
		.map((group) => ({
			...group,
			components: group.components.filter((component) =>
				`${component.name} ${component.category}`.toLowerCase().includes(search)
			),
		}))
		.filter((group) => group.components.length > 0);
	return (
		<nav aria-label="Component index" {...props(shellStyles.nav)}>
			<div {...props(shellStyles.navGroups)}>
				{groups.length === 0 && <p role="status">No matching components.</p>}
				{groups.map((group) => (
					<NavTreeGroup
						forceOpen={search.length > 0}
						key={group.category}
						title={group.category}
					>
						{group.components.map((component) => {
							const isCurrent = component.slug === currentSlug;
							return (
								<Link
									{...props(
										shellStyles.navLink,
										isCurrent && shellStyles.navLinkCurrent
									)}
									aria-current={isCurrent ? "page" : undefined}
									key={component.slug}
									params={{ slug: component.slug }}
									to="/docs/components/$slug"
								>
									<span {...props(typographyStyles.controlLabel)}>
										{component.name}
									</span>
								</Link>
							);
						})}
					</NavTreeGroup>
				))}
			</div>
		</nav>
	);
}
