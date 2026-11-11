"use client";

import { props } from "@stylexjs/stylex";
import { Children, type ComponentPropsWithRef, type ReactElement } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { Button } from "../button/button";
import type { ListItemProps } from "../list/list";
import { Popover, PopoverPopup, PopoverTrigger } from "../popover/popover";
import { overflowListStyles } from "./overflow-list.styles";

export type OverflowListProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	children?:
		| ReactElement<ListItemProps>
		| readonly ReactElement<ListItemProps>[];
	visibleCount?: number;
	overflowLabel?: string;
};

export function OverflowList({
	"aria-label": ariaLabel,
	children,
	overflowLabel = "More items",
	ref: forwardedRef,
	visibleCount = 3,
	...rest
}: OverflowListProps) {
	if (!ariaLabel?.trim()) {
		throw new TypeError("OverflowList requires a non-empty aria-label.");
	}
	if (!Number.isSafeInteger(visibleCount) || visibleCount < 0) {
		throw new RangeError("visibleCount must be a non-negative safe integer");
	}
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	const items = Children.toArray(children);
	const visibleItems = items.slice(0, visibleCount);
	const overflowItems = items.slice(visibleItems.length);

	return (
		<div {...rest} data-slot="overflow-list" ref={forwardedRef}>
			<ul
				aria-label={ariaLabel}
				data-slot="overflow-list-items"
				// biome-ignore lint/a11y/noRedundantRoles: list markers are removed, which can hide list semantics in Safari.
				role="list"
				{...props(overflowListStyles.items, typeRoles.ui)}
			>
				{visibleItems}
				{overflowItems.length > 0 ? (
					<li
						data-slot="overflow-list-trigger-item"
						{...props(overflowListStyles.triggerItem)}
					>
						<Popover>
							<PopoverTrigger
								aria-label={`${overflowLabel} (${overflowItems.length})`}
								render={<Button size="sm" variant="outline" />}
							>
								{overflowLabel} ({overflowItems.length})
							</PopoverTrigger>
							<PopoverPopup aria-label={overflowLabel}>
								<ul
									aria-label={overflowLabel}
									data-slot="overflow-list-menu"
									// biome-ignore lint/a11y/noRedundantRoles: list markers are removed, which can hide list semantics in Safari.
									role="list"
									{...props(overflowListStyles.menu, typeRoles.ui)}
								>
									{overflowItems}
								</ul>
							</PopoverPopup>
						</Popover>
					</li>
				) : null}
			</ul>
		</div>
	);
}
