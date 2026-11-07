"use client";

import { props } from "@stylexjs/stylex";
import {
	type ComponentPropsWithRef,
	type KeyboardEvent,
	useCallback,
	useState,
} from "react";
import type { Closed } from "../../closed";
import { IconChevronLeft, IconChevronRight } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import {
	guardHostProps,
	Lightbox,
	LightboxImage,
	LightboxPopup,
	LightboxTitle,
} from "./lightbox";
import { lightboxStyles } from "./lightbox.styles";

export interface LightboxGalleryImage {
	alt: string;
	src: string;
	/** A smaller file for the grid. Defaults to `src`. */
	thumbnail?: string;
}

export type LightboxGalleryProps = Omit<
	Closed<ComponentPropsWithRef<"ul">>,
	"aria-label" | "children" | "data-slot"
> & {
	/** Names the grid and titles the open lightbox. */
	"aria-label": string;
	images: readonly LightboxGalleryImage[];
};

function Chevron({ next }: { next: boolean }) {
	const Icon = next ? IconChevronRight : IconChevronLeft;
	return (
		<Icon
			aria-hidden="true"
			focusable={false}
			size={18}
			{...props(lightboxStyles.chevron)}
		/>
	);
}

function GalleryPill({
	count,
	index,
	onStep,
}: {
	count: number;
	index: number;
	onStep: (delta: number) => void;
}) {
	const previous = useCallback(() => onStep(-1), [onStep]);
	const next = useCallback(() => onStep(1), [onStep]);
	const button = props(lightboxStyles.control, lightboxStyles.pillButton);
	return (
		<div data-slot="lightbox-gallery-controls" {...props(lightboxStyles.pill)}>
			<button
				aria-label="Previous image"
				onClick={previous}
				type="button"
				{...button}
			>
				<Chevron next={false} />
			</button>
			<span aria-live="polite" {...props(typeRoles.ui, lightboxStyles.counter)}>
				{index + 1} of {count}
			</span>
			<button aria-label="Next image" onClick={next} type="button" {...button}>
				<Chevron next />
			</button>
		</div>
	);
}

/** The open lightbox for a set of images; Message reuses it for sent files. */
export function GalleryPopup({
	images,
	index,
	onStep,
	title,
}: {
	images: readonly LightboxGalleryImage[];
	index: number;
	onStep: (delta: number) => void;
	title: string;
}) {
	const image = images[index];
	// Arrow keys follow reading direction, so Right is previous in RTL.
	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
			const forward = rtl ? "ArrowLeft" : "ArrowRight";
			const back = rtl ? "ArrowRight" : "ArrowLeft";
			if (event.key === forward || event.key === back) {
				event.preventDefault();
				onStep(event.key === forward ? 1 : -1);
			}
		},
		[onStep]
	);
	if (!image) {
		return null;
	}
	return (
		<LightboxPopup onKeyDown={onKeyDown}>
			<LightboxTitle>{title}</LightboxTitle>
			<LightboxImage alt={image.alt} key={image.src} src={image.src} />
			{images.length > 1 ? (
				<GalleryPill count={images.length} index={index} onStep={onStep} />
			) : null}
		</LightboxPopup>
	);
}

function GalleryItem({
	image,
	onOpen,
	position,
}: {
	image: LightboxGalleryImage;
	onOpen: (position: number) => void;
	position: number;
}) {
	const open = useCallback(() => onOpen(position), [onOpen, position]);
	return (
		<li {...props(lightboxStyles.galleryCell)}>
			<button
				data-slot="lightbox-gallery-item"
				onClick={open}
				type="button"
				{...props(lightboxStyles.galleryItem)}
			>
				{/* biome-ignore lint/performance/noImgElement: Lightbox uses native images so this package stays framework-neutral. */}
				{/* biome-ignore lint/correctness/useImageSize: thumbnails fill a square cell with object-fit. */}
				<img
					alt={image.alt}
					src={image.thumbnail ?? image.src}
					{...props(lightboxStyles.galleryImage)}
				/>
			</button>
		</li>
	);
}

/**
 * A grid of thumbnails that opens one lightbox. Previous, Next, and the arrow
 * keys page through the set, wrapping at either end.
 */
export function LightboxGallery({
	"aria-label": label,
	images,
	ref: forwardedRef,
	...rest
}: LightboxGalleryProps) {
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	const count = images.length;
	const step = useCallback(
		(delta: number) => setIndex((current) => (current + delta + count) % count),
		[count]
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: the React Compiler keeps this memoization only with the setters listed.
	const openAt = useCallback(
		(position: number) => {
			setIndex(position);
			setOpen(true);
		},
		[setIndex, setOpen]
	);
	if (!label?.trim()) {
		throw new TypeError("LightboxGallery requires a non-empty aria-label.");
	}
	return (
		<>
			<ul
				{...guardHostProps(rest)}
				aria-label={label}
				data-slot="lightbox-gallery"
				ref={forwardedRef}
				{...props(lightboxStyles.gallery)}
			>
				{images.map((image, position) => (
					<GalleryItem
						image={image}
						key={image.src}
						onOpen={openAt}
						position={position}
					/>
				))}
			</ul>
			<Lightbox onOpenChange={setOpen} open={open}>
				<GalleryPopup
					images={images}
					index={index}
					onStep={step}
					title={label}
				/>
			</Lightbox>
		</>
	);
}
