"use client";

import { props } from "@stylexjs/stylex";
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import type { Closed } from "../../closed";
import { IconChevronLeft, IconChevronRight } from "../../icons";
import { assignRef } from "../../ref-utils";
import { typeRoles } from "../../styles/typography.styles";
import { Button } from "../button/button";
import { carouselStyles } from "./carousel.styles";

type AccessibleName =
	| { "aria-label": string; "aria-labelledby"?: never }
	| { "aria-label"?: never; "aria-labelledby": string };

interface CarouselContextValue {
	canNext: boolean;
	canPrevious: boolean;
	count: number;
	goTo: (index: number) => void;
	/** The slide closest to the viewport's start edge. */
	index: number;
	onNext: () => void;
	onPrevious: () => void;
	registerViewport: (
		element: HTMLDivElement | null
	) => undefined | (() => void);
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export type CarouselProps = Omit<
	Closed<ComponentPropsWithRef<"section">>,
	| "aria-label"
	| "aria-labelledby"
	| "aria-roledescription"
	| "children"
	| "data-slot"
	| "role"
> &
	AccessibleName & {
		children: ReactNode;
	};

export type CarouselContentProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	| "aria-label"
	| "aria-labelledby"
	| "aria-roledescription"
	| "children"
	| "data-slot"
	| "role"
	| "tabIndex"
> & {
	children: ReactNode;
};

export type CarouselItemProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-roledescription" | "children" | "data-slot" | "role" | "tabIndex"
> & {
	children: ReactNode;
};

export type CarouselIndicatorsProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	/** Names the group of slide buttons. Defaults to "Slides". */
	"aria-label"?: string;
};

export type CarouselControlProps = Omit<
	Closed<ComponentPropsWithRef<"button">>,
	| "aria-label"
	| "children"
	| "data-slot"
	| "disabled"
	| "onClick"
	| "role"
	| "type"
> & {
	"aria-label"?: string;
};

function useCarouselContext() {
	const context = useContext(CarouselContext);
	if (!context) {
		throw new Error("Carousel controls and content must be inside Carousel.");
	}
	return context;
}

function stripReservedProps(value: object, names: readonly string[]) {
	for (const name of names) {
		Reflect.deleteProperty(value, name);
	}
}

interface ScrollState {
	canNext: boolean;
	canPrevious: boolean;
	count: number;
	index: number;
}

const EMPTY_STATE: ScrollState = {
	canNext: false,
	canPrevious: false,
	count: 0,
	index: 0,
};

function sameState(left: ScrollState, right: ScrollState) {
	return (
		left.canNext === right.canNext &&
		left.canPrevious === right.canPrevious &&
		left.count === right.count &&
		left.index === right.index
	);
}

function getScrollState(viewport: HTMLDivElement): ScrollState {
	const track = viewport.firstElementChild;
	if (!(track?.firstElementChild && track.lastElementChild)) {
		return EMPTY_STATE;
	}

	const { direction } = getComputedStyle(viewport);
	const viewportBounds = viewport.getBoundingClientRect();
	const firstBounds = track.firstElementChild.getBoundingClientRect();
	const lastBounds = track.lastElementChild.getBoundingClientRect();
	const tolerance = 1;
	const canPrevious =
		direction === "rtl"
			? firstBounds.right > viewportBounds.right + tolerance
			: firstBounds.left < viewportBounds.left - tolerance;
	const canNext =
		direction === "rtl"
			? lastBounds.left < viewportBounds.left - tolerance
			: lastBounds.right > viewportBounds.right + tolerance;
	const items = Array.from(track.children);
	// At the far end the last slide may never reach the start edge, so it counts
	// as current once nothing is left to scroll.
	const index = canNext
		? getClosestSlideIndex(items, viewportBounds, direction === "rtl")
		: items.length - 1;

	return { canNext, canPrevious, count: items.length, index };
}

function scrollToItem(viewport: HTMLDivElement, target: Element) {
	const viewportBounds = viewport.getBoundingClientRect();
	const targetBounds = target.getBoundingClientRect();
	const delta =
		getComputedStyle(viewport).direction === "rtl"
			? targetBounds.right - viewportBounds.right
			: targetBounds.left - viewportBounds.left;
	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;
	viewport.scrollBy({
		behavior: reducedMotion ? "auto" : "smooth",
		left: delta,
	});
}

// Mouse drag: browsers scroll on touch and trackpads natively, but not when a
// mouse drags, so the viewport follows the pointer itself.
const DRAG_THRESHOLD = 5;
// Pixels per millisecond: a release faster than this moves one slide.
const FLICK_VELOCITY = 0.3;
// A pointer held still this long before release has stopped flicking.
const FLICK_WINDOW = 80;

interface DragState {
	dragging: boolean;
	lastTime: number;
	lastX: number;
	startIndex: number;
	startLeft: number;
	startX: number;
	velocity: number;
}

function getSlides(viewport: HTMLDivElement) {
	return Array.from(viewport.firstElementChild?.children ?? []);
}

function isRtl(element: Element) {
	return getComputedStyle(element).direction === "rtl";
}

function nearestSlide(viewport: HTMLDivElement) {
	return getClosestSlideIndex(
		getSlides(viewport),
		viewport.getBoundingClientRect(),
		isRtl(viewport)
	);
}

function settleIndex(viewport: HTMLDivElement, drag: DragState) {
	const count = getSlides(viewport).length;
	const nearest = nearestSlide(viewport);
	if (Math.abs(drag.velocity) < FLICK_VELOCITY) {
		return nearest;
	}
	// Pulling content toward the start reveals the next slide.
	const forward = isRtl(viewport) ? drag.velocity > 0 : drag.velocity < 0;
	const target = forward
		? Math.max(nearest, drag.startIndex + 1)
		: Math.min(nearest, drag.startIndex - 1);
	return Math.max(0, Math.min(count - 1, target));
}

// The scroll position that puts a slide on its snap point, clamped to the
// scroll range (right-to-left positions run negative).
function snapLeft(viewport: HTMLDivElement, target: Element) {
	const rtl = isRtl(viewport);
	const viewportBounds = viewport.getBoundingClientRect();
	const targetBounds = target.getBoundingClientRect();
	const delta = rtl
		? targetBounds.right - viewportBounds.right
		: targetBounds.left - viewportBounds.left;
	const max = viewport.scrollWidth - viewport.clientWidth;
	const left = viewport.scrollLeft + delta;
	return rtl
		? Math.min(0, Math.max(-max, left))
		: Math.max(0, Math.min(max, left));
}

// Eases out from the release, fast first like a throw, and lands exactly on
// the snap point so restoring snap moves nothing.
function glide(viewport: HTMLDivElement, to: number, onDone: () => void) {
	const from = viewport.scrollLeft;
	const distance = to - from;
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (reduced || Math.abs(distance) < 1) {
		viewport.scrollLeft = to;
		onDone();
		return () => undefined;
	}
	const duration = Math.min(420, 180 + Math.abs(distance) * 0.35);
	let startTime: number | null = null;
	let frame = 0;
	const step = (now: number) => {
		startTime ??= now;
		const progress = Math.min(1, (now - startTime) / duration);
		viewport.scrollLeft = from + distance * (1 - (1 - progress) ** 3);
		if (progress < 1) {
			frame = requestAnimationFrame(step);
		} else {
			onDone();
		}
	};
	frame = requestAnimationFrame(step);
	return () => cancelAnimationFrame(frame);
}

// A drag ends with a click on whatever sits under the pointer; swallow it.
function suppressNextClick(viewport: HTMLDivElement) {
	const swallow = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	};
	viewport.addEventListener("click", swallow, { capture: true, once: true });
	setTimeout(() => viewport.removeEventListener("click", swallow, true), 0);
}

function trackVelocity(drag: DragState, event: PointerEvent) {
	const elapsed = event.timeStamp - drag.lastTime;
	if (elapsed > 0) {
		// Averages recent moves so one uneven event cannot decide a flick.
		const sample = (event.clientX - drag.lastX) / elapsed;
		drag.velocity = drag.velocity * 0.4 + sample * 0.6;
	}
	drag.lastTime = event.timeStamp;
	drag.lastX = event.clientX;
}

function attachMouseDrag(viewport: HTMLDivElement) {
	let drag: DragState | null = null;
	let cancelGlide: () => void = () => undefined;
	const stopGlide = () => {
		cancelGlide();
		viewport.removeAttribute("data-settling");
	};
	const onPointerDown = (event: PointerEvent) => {
		stopGlide();
		if (event.pointerType !== "mouse" || event.button !== 0) {
			return;
		}
		drag = {
			dragging: false,
			lastTime: event.timeStamp,
			lastX: event.clientX,
			startIndex: nearestSlide(viewport),
			startLeft: viewport.scrollLeft,
			startX: event.clientX,
			velocity: 0,
		};
	};
	const startDragging = (state: DragState, event: PointerEvent) => {
		state.dragging = true;
		// Counts from here, so content does not jump by the threshold.
		state.startX = event.clientX;
		viewport.setPointerCapture(event.pointerId);
		viewport.setAttribute("data-dragging", "");
		window.getSelection()?.removeAllRanges();
	};
	const onPointerMove = (event: PointerEvent) => {
		const offset = drag ? event.clientX - drag.startX : 0;
		if (!drag || (!drag.dragging && Math.abs(offset) < DRAG_THRESHOLD)) {
			return;
		}
		if (!drag.dragging) {
			startDragging(drag, event);
		}
		viewport.scrollLeft = drag.startLeft - (event.clientX - drag.startX);
		trackVelocity(drag, event);
	};
	const onPointerUp = (event: PointerEvent) => {
		const state = drag;
		drag = null;
		if (!state?.dragging) {
			return;
		}
		if (viewport.hasPointerCapture(event.pointerId)) {
			viewport.releasePointerCapture(event.pointerId);
		}
		if (event.timeStamp - state.lastTime > FLICK_WINDOW) {
			state.velocity = 0;
		}
		const target = getSlides(viewport)[settleIndex(viewport, state)];
		// Snap stays off until the glide lands, so the browser never snaps back.
		viewport.setAttribute("data-settling", "");
		viewport.removeAttribute("data-dragging");
		suppressNextClick(viewport);
		cancelGlide = target
			? glide(viewport, snapLeft(viewport, target), stopGlide)
			: () => undefined;
		if (!target) {
			stopGlide();
		}
	};
	// Native image and link dragging would steal the gesture.
	const onDragStart = (event: DragEvent) => event.preventDefault();
	const listeners = [
		["pointerdown", onPointerDown],
		["pointermove", onPointerMove],
		["pointerup", onPointerUp],
		["pointercancel", onPointerUp],
		["dragstart", onDragStart],
		["wheel", stopGlide],
		["touchstart", stopGlide],
	] as const;
	for (const [type, listener] of listeners) {
		viewport.addEventListener(type, listener as EventListener, {
			passive: type === "wheel" || type === "touchstart",
		});
	}
	return () => {
		stopGlide();
		for (const [type, listener] of listeners) {
			viewport.removeEventListener(type, listener as EventListener);
		}
	};
}

function getInlineStartDistance(
	item: Element,
	viewportBounds: DOMRect,
	directionIsRtl: boolean
) {
	const bounds = item.getBoundingClientRect();
	return Math.abs(
		directionIsRtl
			? viewportBounds.right - bounds.right
			: bounds.left - viewportBounds.left
	);
}

function getClosestSlideIndex(
	items: Element[],
	viewportBounds: DOMRect,
	directionIsRtl: boolean
) {
	let currentIndex = 0;
	let closestDistance = Number.POSITIVE_INFINITY;
	for (const [index, item] of items.entries()) {
		const distance = getInlineStartDistance(
			item,
			viewportBounds,
			directionIsRtl
		);
		if (distance < closestDistance) {
			currentIndex = index;
			closestDistance = distance;
		}
	}
	return currentIndex;
}

export function Carousel(carouselProps: CarouselProps) {
	const {
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		children,
		ref: forwardedRef,
		...rest
	} = carouselProps;
	const accessibleName = ariaLabel ?? ariaLabelledBy;
	if (!accessibleName?.trim()) {
		throw new TypeError("Carousel requires a non-empty accessible name.");
	}

	const [scrollState, setScrollState] = useState<ScrollState>(EMPTY_STATE);
	const viewportElement = useRef<HTMLDivElement>(null);
	const pendingTargetIndex = useRef<number | null>(null);
	const registerViewport = useCallback((viewport: HTMLDivElement | null) => {
		viewportElement.current = viewport;
		if (!viewport) {
			return;
		}
		const update = () => {
			const nextState = getScrollState(viewport);
			setScrollState((current) =>
				sameState(current, nextState) ? current : nextState
			);
		};
		const clearPendingTarget = () => {
			pendingTargetIndex.current = null;
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.target === viewport &&
				[
					"ArrowDown",
					"ArrowLeft",
					"ArrowRight",
					"ArrowUp",
					"End",
					"Home",
					"PageDown",
					"PageUp",
					" ",
				].includes(event.key)
			) {
				clearPendingTarget();
			}
		};
		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? undefined
				: new ResizeObserver(() => {
						clearPendingTarget();
						update();
					});
		const mutationObserver =
			typeof MutationObserver === "undefined"
				? undefined
				: new MutationObserver(() => {
						clearPendingTarget();
						update();
					});
		const track = viewport.firstElementChild;
		resizeObserver?.observe(viewport);
		if (track) {
			resizeObserver?.observe(track);
			mutationObserver?.observe(track, { childList: true });
		}
		viewport.addEventListener("scroll", update, { passive: true });
		viewport.addEventListener("scrollend", clearPendingTarget);
		viewport.addEventListener("wheel", clearPendingTarget, { passive: true });
		viewport.addEventListener("pointerdown", clearPendingTarget);
		viewport.addEventListener("touchstart", clearPendingTarget, {
			passive: true,
		});
		viewport.addEventListener("keydown", handleKeyDown);
		const detachMouseDrag = attachMouseDrag(viewport);
		update();
		return () => {
			detachMouseDrag();
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
			viewport.removeEventListener("scroll", update);
			viewport.removeEventListener("scrollend", clearPendingTarget);
			viewport.removeEventListener("wheel", clearPendingTarget);
			viewport.removeEventListener("pointerdown", clearPendingTarget);
			viewport.removeEventListener("touchstart", clearPendingTarget);
			viewport.removeEventListener("keydown", handleKeyDown);
			if (viewportElement.current === viewport) {
				viewportElement.current = null;
			}
		};
	}, []);
	const move = useCallback((direction: "next" | "previous") => {
		const viewport = viewportElement.current;
		const track = viewport?.firstElementChild;
		if (!(viewport && track) || track.children.length < 2) {
			return;
		}
		const viewportBounds = viewport.getBoundingClientRect();
		const directionIsRtl = getComputedStyle(viewport).direction === "rtl";
		const items = Array.from(track.children);
		const currentIndex =
			pendingTargetIndex.current ??
			getClosestSlideIndex(items, viewportBounds, directionIsRtl);
		const nextIndex = Math.max(
			0,
			Math.min(items.length - 1, currentIndex + (direction === "next" ? 1 : -1))
		);
		const target = items[nextIndex];
		if (!target) {
			return;
		}
		pendingTargetIndex.current = nextIndex;
		scrollToItem(viewport, target);
	}, []);
	const goTo = useCallback((index: number) => {
		const viewport = viewportElement.current;
		const target = viewport?.firstElementChild?.children[index];
		if (viewport && target) {
			pendingTargetIndex.current = index;
			scrollToItem(viewport, target);
		}
	}, []);
	const onNext = useCallback(() => move("next"), [move]);
	const onPrevious = useCallback(() => move("previous"), [move]);

	stripReservedProps(rest, [
		"aria-roledescription",
		"className",
		"data-slot",
		"role",
		"style",
	]);

	return (
		<CarouselContext.Provider
			value={{
				canNext: scrollState.canNext,
				canPrevious: scrollState.canPrevious,
				count: scrollState.count,
				goTo,
				index: scrollState.index,
				onNext,
				onPrevious,
				registerViewport,
			}}
		>
			<section
				{...rest}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-roledescription="carousel"
				data-slot="carousel"
				ref={forwardedRef}
				{...props(carouselStyles.root, typeRoles.body)}
			>
				{children}
			</section>
		</CarouselContext.Provider>
	);
}

export function CarouselContent(contentProps: CarouselContentProps) {
	const { children, ref: forwardedRef, ...rest } = contentProps;
	const { registerViewport } = useCarouselContext();
	const viewportRef = useCallback(
		(viewport: HTMLDivElement | null) => {
			const cleanupViewport = registerViewport(viewport);
			const cleanupConsumerRef = assignRef(forwardedRef, viewport);
			if (typeof cleanupViewport !== "function") {
				return cleanupConsumerRef;
			}
			return () => {
				cleanupViewport();
				cleanupConsumerRef?.();
			};
		},
		[forwardedRef, registerViewport]
	);
	stripReservedProps(rest, [
		"aria-label",
		"aria-labelledby",
		"aria-roledescription",
		"className",
		"data-slot",
		"role",
		"style",
		"tabIndex",
	]);
	return (
		<div
			{...rest}
			data-slot="carousel-viewport"
			ref={viewportRef}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: A focusable scroll viewport lets keyboard users scroll the native track.
			tabIndex={0}
			{...props(carouselStyles.viewport)}
		>
			<div
				aria-live="polite"
				data-slot="carousel-track"
				{...props(carouselStyles.track)}
			>
				{children}
			</div>
		</div>
	);
}

export function CarouselItem(itemProps: CarouselItemProps) {
	const { children, ref: forwardedRef, ...rest } = itemProps;
	stripReservedProps(rest, [
		"aria-roledescription",
		"className",
		"data-slot",
		"role",
		"style",
		"tabIndex",
	]);
	return (
		// biome-ignore lint/a11y/useSemanticElements: Each slide is a named group; a fieldset would misrepresent non-form content.
		<div
			{...rest}
			aria-roledescription="slide"
			data-slot="carousel-item"
			ref={forwardedRef}
			role="group"
			{...props(carouselStyles.item)}
		>
			{/* The surface scales while the slide keeps its layout box, so scroll
			    room and snap points never change as slides animate. */}
			<div data-slot="carousel-item-surface" {...props(carouselStyles.surface)}>
				{children}
			</div>
		</div>
	);
}

function CarouselIndicator({
	count,
	current,
	onSelect,
	slide,
}: {
	count: number;
	current: boolean;
	onSelect: (slide: number) => void;
	slide: number;
}) {
	const select = useCallback(() => onSelect(slide), [onSelect, slide]);
	return (
		<button
			aria-current={current || undefined}
			aria-label={`Slide ${slide + 1} of ${count}`}
			data-slot="carousel-indicator"
			onClick={select}
			type="button"
			{...props(carouselStyles.indicator)}
		>
			<span aria-hidden="true" {...props(carouselStyles.dot)} />
		</button>
	);
}

/** One button per slide; the current one stretches into a short pill. */
export function CarouselIndicators(indicatorProps: CarouselIndicatorsProps) {
	const {
		"aria-label": ariaLabel = "Slides",
		ref: forwardedRef,
		...rest
	} = indicatorProps;
	const { count, goTo, index } = useCarouselContext();
	stripReservedProps(rest, ["className", "data-slot", "role", "style"]);
	return (
		// biome-ignore lint/a11y/useSemanticElements: a set of slide buttons is a named group, not a form fieldset.
		<div
			{...rest}
			aria-label={ariaLabel}
			data-slot="carousel-indicators"
			ref={forwardedRef}
			role="group"
			{...props(carouselStyles.indicators)}
		>
			{Array.from({ length: count }, (_, slide) => (
				<CarouselIndicator
					count={count}
					current={slide === index}
					// biome-ignore lint/suspicious/noArrayIndexKey: a slide's position is its identity here.
					key={slide}
					onSelect={goTo}
					slide={slide}
				/>
			))}
		</div>
	);
}

export function CarouselPrevious(controlProps: CarouselControlProps) {
	const {
		"aria-label": ariaLabel = "Previous slide",
		ref: forwardedRef,
		...rest
	} = controlProps;
	const { canPrevious, onPrevious } = useCarouselContext();
	stripReservedProps(rest, [
		"className",
		"data-slot",
		"disabled",
		"onClick",
		"role",
		"style",
		"type",
	]);
	return (
		<Button
			{...rest}
			aria-label={ariaLabel}
			data-slot="carousel-previous"
			disabled={!canPrevious}
			onClick={onPrevious}
			ref={forwardedRef}
			size="icon"
			type="button"
			variant="outline"
		>
			<Chevron direction="previous" />
		</Button>
	);
}

export function CarouselNext(controlProps: CarouselControlProps) {
	const {
		"aria-label": ariaLabel = "Next slide",
		ref: forwardedRef,
		...rest
	} = controlProps;
	const { canNext, onNext } = useCarouselContext();
	stripReservedProps(rest, [
		"className",
		"data-slot",
		"disabled",
		"onClick",
		"role",
		"style",
		"type",
	]);
	return (
		<Button
			{...rest}
			aria-label={ariaLabel}
			data-slot="carousel-next"
			disabled={!canNext}
			onClick={onNext}
			ref={forwardedRef}
			size="icon"
			type="button"
			variant="outline"
		>
			<Chevron direction="next" />
		</Button>
	);
}

function Chevron({ direction }: { direction: "next" | "previous" }) {
	const Icon = direction === "next" ? IconChevronRight : IconChevronLeft;
	return (
		<Icon
			aria-hidden="true"
			focusable={false}
			size={16}
			{...props(carouselStyles.icon)}
		/>
	);
}
