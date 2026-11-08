"use client";

import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { IconFile, IconWorld } from "../../icons";
import { inlineCitationStyles as styles } from "./inline-citation.styles";

/**
 * A cited source. With `href` it is a link labelled by its domain, and the
 * title is optional. Without one, such as an uploaded document, it needs a
 * title and shows as text.
 */
export type CitationSource = {
	/** One line on what the source says, shown in its preview. */
	description?: string;
	/**
	 * A small square image. Defaults to the site's own `/favicon.ico`; a
	 * globe stands in when there is none.
	 */
	icon?: string;
} & ({ href: string; title?: string } | { href?: undefined; title: string });

const LEADING_WWW = /^www\./u;
// Reserved for examples and tests (RFC 2606); they never serve an icon.
const RESERVED_HOST =
	/(?:^|\.)(?:example\.(?:com|net|org)|example|test|invalid|localhost)$/u;

function sourceDomain(href: string) {
	return URL.canParse(href)
		? new URL(href).hostname.replace(LEADING_WWW, "")
		: href;
}

/** What the chip shows: the domain of a link, or the title of a document. */
export function sourceLabel(source: CitationSource) {
	return source.href === undefined ? source.title : sourceDomain(source.href);
}

/** The fullest name available: the title, or the domain without one. */
export function sourceName(source: CitationSource) {
	return source.title ?? sourceLabel(source);
}

// The site's own icon, so no third-party service learns what was cited.
function faviconOf(source: CitationSource) {
	if (source.icon) {
		return source.icon;
	}
	if (source.href === undefined || !URL.canParse(source.href)) {
		return;
	}
	const url = new URL(source.href);
	const web = url.protocol === "https:" || url.protocol === "http:";
	return web && !RESERVED_HOST.test(url.hostname)
		? `${url.origin}/favicon.ico`
		: undefined;
}

export function SourceIcon({ source }: { source: CitationSource }) {
	const src = faviconOf(source);
	const [failed, setFailed] = useState<string | null>(null);
	const fail = useCallback(() => setFailed(src ?? null), [src]);
	// A server-rendered icon can fail before hydration, when no handler is
	// attached yet; a finished image with no width has failed.
	const check = useCallback(
		(image: HTMLImageElement | null) => {
			if (image?.complete && image.naturalWidth === 0) {
				fail();
			}
		},
		[fail]
	);
	if (source.href === undefined && !source.icon) {
		// A document, such as a file from the person's workspace.
		return (
			<IconFile
				aria-hidden="true"
				size={12}
				{...props(styles.faviconFallback)}
			/>
		);
	}
	if (!src || failed === src) {
		return (
			<IconWorld
				aria-hidden="true"
				size={12}
				{...props(styles.faviconFallback)}
			/>
		);
	}
	return (
		// biome-ignore lint/performance/noImgElement: Mizen stays framework-neutral, so it uses a native image.
		// biome-ignore lint/correctness/useImageSize: the icon is a fixed 12px square set in styles.
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError swaps in the globe when a site has no icon; it is not an interaction.
		<img
			alt=""
			onError={fail}
			ref={check}
			referrerPolicy="no-referrer"
			src={src}
			{...props(styles.favicon)}
		/>
	);
}
