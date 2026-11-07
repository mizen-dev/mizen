"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { IconChevronDown } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import {
	type CitationSource,
	SourceIcon,
	sourceLabel,
	sourceName,
} from "../inline-citation/citation-source";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { sourcesStyles as styles } from "./sources.styles";

/** A page or document the agent used: a link with `href`, or text without. */
export type SourcesItem = CitationSource;

export type SourcesProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	/** Opens the list from the start, such as in a research view. */
	defaultOpen?: boolean;
	/** Repeats of the same link or document show once. */
	sources: readonly SourcesItem[];
};

/** The same page cited twice is one source. */
export function uniqueSources(sources: readonly SourcesItem[]) {
	const seen = new Set<string>();
	return sources.filter((source) => {
		const key = source.href ?? `document:${source.title}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/** "Used 3 sources" with the first three favicons; opens the list. */
function SourcesTrigger({ sources }: { sources: readonly SourcesItem[] }) {
	const noun = sources.length === 1 ? "source" : "sources";
	return (
		<CollapsibleTrigger
			render={<button type="button" {...props(typeRoles.ui, styles.trigger)} />}
		>
			<span aria-hidden="true" {...props(styles.stack)}>
				{sources.slice(0, 3).map((source, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: sources keep their order, and a document may share a title.
					<span key={index} {...props(styles.stackIcon)}>
						<SourceIcon source={source} />
					</span>
				))}
			</span>
			<span>
				Used <span {...props(styles.count)}>{sources.length}</span> {noun}
			</span>
			<IconChevronDown
				aria-hidden="true"
				size={14}
				{...props(styles.chevron)}
			/>
		</CollapsibleTrigger>
	);
}

/** One source as a row: favicon, title, and domain; a link when it has one. */
export function SourceRow({ source }: { source: SourcesItem }) {
	const content = (
		<>
			<SourceIcon source={source} />
			<span {...props(styles.title)}>{sourceName(source)}</span>
			{source.href === undefined ? null : (
				<span {...props(typeRoles.caption, styles.domain)}>
					{sourceLabel(source)}
				</span>
			)}
		</>
	);
	if (source.href === undefined) {
		return <div {...props(typeRoles.ui, styles.row)}>{content}</div>;
	}
	return (
		<a
			href={source.href}
			rel="noopener noreferrer"
			target="_blank"
			{...props(typeRoles.ui, styles.row)}
		>
			{content}
			<VisuallyHidden>, opens in a new tab</VisuallyHidden>
		</a>
	);
}

/** One line per source: favicon, title, and domain. */
function SourcesList({ sources }: { sources: readonly SourcesItem[] }) {
	return (
		<CollapsiblePanel>
			<ul aria-label="Sources" data-slot="sources-list" {...props(styles.list)}>
				{sources.map((source, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: sources keep their order, and a document may share a title.
					<li key={index}>
						<SourceRow source={source} />
					</li>
				))}
			</ul>
		</CollapsiblePanel>
	);
}

/**
 * The pages and documents an agent used for a reply, folded into one line:
 * the first favicons and "Used 3 sources". It opens to a link for each.
 */
export function Sources({
	defaultOpen = false,
	ref: forwardedRef,
	sources,
	...rest
}: SourcesProps) {
	const unique = uniqueSources(sources);
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	if (unique.length === 0) {
		return null;
	}
	return (
		<div
			{...rest}
			data-slot="sources"
			ref={forwardedRef}
			{...props(styles.root)}
		>
			<Collapsible defaultOpen={defaultOpen}>
				<SourcesTrigger sources={unique} />
				<SourcesList sources={unique} />
			</Collapsible>
		</div>
	);
}
