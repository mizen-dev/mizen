"use client";

import { props, type StyleXStyles } from "@stylexjs/stylex";
import { typeRoles } from "../../styles/typography.styles";
import { Popover, PopoverPrimitive } from "../popover/popover";
import { popoverStyles } from "../popover/popover.styles";
import {
	PreviewCard,
	PreviewCardPrimitive,
} from "../preview-card/preview-card";
import { previewCardStyles } from "../preview-card/preview-card.styles";
import { SourceRow, uniqueSources } from "../sources/sources";
import { sourcesStyles } from "../sources/sources.styles";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import {
	type CitationSource,
	SourceIcon,
	sourceLabel,
	sourceName,
} from "./citation-source";
import { inlineCitationStyles as styles } from "./inline-citation.styles";

/** A page or document the text cites. */
export type InlineCitationSource = CitationSource;

export interface InlineCitationProps {
	/**
	 * The sources behind this point in the text. Several show as one chip,
	 * such as "web.dev +2", that opens a list of them.
	 */
	sources: readonly InlineCitationSource[];
}

// Previews wait a moment, so passing over the text does not flash cards.
const PREVIEW_DELAY = 300;

function SourceCard({ source }: { source: CitationSource }) {
	return (
		<div data-slot="inline-citation-card" {...props(styles.card)}>
			<span {...props(typeRoles.caption, styles.cardSite)}>
				<SourceIcon source={source} />
				{sourceLabel(source)}
			</span>
			{source.title ? (
				<p {...props(typeRoles.label, styles.cardTitle)}>{source.title}</p>
			) : null}
			{source.description ? (
				<p {...props(typeRoles.caption, styles.cardDescription)}>
					{source.description}
				</p>
			) : null}
		</div>
	);
}

// A link to the page, with a preview on hover or focus.
function LinkChip({
	arrival,
	source,
}: {
	arrival?: StyleXStyles;
	source: CitationSource & { href: string };
}) {
	const label = sourceLabel(source);
	const name = sourceName(source);
	return (
		<PreviewCard>
			{/* The primitive keeps the chip's own slot; the wrapper would replace it. */}
			<PreviewCardPrimitive.Trigger
				delay={PREVIEW_DELAY}
				href={source.href}
				render={
					<a
						data-slot="inline-citation"
						rel="noopener noreferrer"
						target="_blank"
						{...props(typeRoles.caption, styles.chip, arrival)}
					/>
				}
			>
				<SourceIcon source={source} />
				{label}
				<VisuallyHidden>
					{name === label ? "" : `, ${name}`}, opens in a new tab
				</VisuallyHidden>
			</PreviewCardPrimitive.Trigger>
			<PreviewCardPrimitive.Portal>
				<PreviewCardPrimitive.Positioner
					sideOffset={4}
					{...props(previewCardStyles.positioner)}
				>
					<PreviewCardPrimitive.Popup
						{...props(previewCardStyles.popup, styles.cardPopup)}
					>
						<SourceCard source={source} />
					</PreviewCardPrimitive.Popup>
				</PreviewCardPrimitive.Positioner>
			</PreviewCardPrimitive.Portal>
		</PreviewCard>
	);
}

// Several sources at one point: the first site and a count, opening a list.
function GroupChip({
	arrival,
	sources,
}: {
	arrival?: StyleXStyles;
	sources: readonly CitationSource[];
}) {
	const [first] = sources;
	if (!first) {
		return null;
	}
	const more = sources.length - 1;
	return (
		<Popover>
			<PopoverPrimitive.Trigger
				delay={PREVIEW_DELAY}
				openOnHover
				render={
					<button
						data-slot="inline-citation"
						type="button"
						{...props(typeRoles.caption, styles.chip, arrival)}
					/>
				}
			>
				<SourceIcon source={first} />
				{sourceLabel(first)}
				<span {...props(styles.count)}> +{more}</span>
				<VisuallyHidden>, {sources.length} sources</VisuallyHidden>
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Positioner
					sideOffset={4}
					{...props(popoverStyles.positioner)}
				>
					<PopoverPrimitive.Popup
						{...props(popoverStyles.popup, styles.listPopup)}
					>
						<ul
							aria-label="Sources"
							data-slot="inline-citation-sources"
							{...props(sourcesStyles.list, styles.group)}
						>
							{sources.map((source, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: sources keep their order, and a document may share a title.
								<li key={index}>
									<SourceRow source={source} />
								</li>
							))}
						</ul>
					</PopoverPrimitive.Popup>
				</PopoverPrimitive.Positioner>
			</PopoverPrimitive.Portal>
		</Popover>
	);
}

/** The chip, with an optional entrance for text that is still arriving. */
export function CitationChip({
	arrival,
	sources,
}: {
	arrival?: StyleXStyles;
	sources: readonly CitationSource[];
}) {
	const unique = uniqueSources(sources);
	const [source] = unique;
	if (!source) {
		return null;
	}
	if (unique.length > 1) {
		return <GroupChip arrival={arrival} sources={unique} />;
	}
	if (source.href === undefined) {
		// A document has nothing to open; its title is the label.
		return (
			<span
				data-slot="inline-citation"
				{...props(typeRoles.caption, styles.chip, styles.chipStatic, arrival)}
			>
				<SourceIcon source={source} />
				{sourceLabel(source)}
			</span>
		);
	}
	return <LinkChip arrival={arrival} source={source} />;
}

/**
 * A source in the sentence it supports: the site's favicon and name, opening
 * the page. On hover or focus it previews the title and what the page says.
 * Several sources at one point show as one chip that lists them.
 */
export function InlineCitation({ sources }: InlineCitationProps) {
	return <CitationChip sources={sources} />;
}
