"use client";

import { create, props, type StyleXStyles } from "@stylexjs/stylex";
import {
	AnimatePresence,
	domAnimation,
	LazyMotion,
	MotionConfig,
	m,
} from "motion/react";
import { Children, isValidElement, type ReactNode, type Ref } from "react";

// Mizen's motion tokens for Motion, which takes numbers: duration.disclosure
// (320ms) with easing.expoOut, or easing.spring for a little overshoot.
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING = [0.34, 1.56, 0.64, 1] as const;
const DISCLOSURE = 0.32;

export const disclosure = { duration: DISCLOSURE, ease: EXPO_OUT } as const;

const styles = create({
	icon: { display: "inline-flex", minInlineSize: 0 },
	// No display of its own: in a row's flex layout it acts as a block, so a
	// long title still ends in an ellipsis.
	text: { minInlineSize: 0 },
});

/** Loads Motion's DOM features and honors the reader's reduced motion. */
export function MotionScope({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={domAnimation} strict>
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</LazyMotion>
	);
}

// Changes animate; mounting does not. A part that loads, or remounts when
// a fold opens, shows its state at once.

/** A status icon that settles in with a little overshoot when it changes. */
export function Pop({
	change,
	children,
	look,
	ref,
}: {
	change: string;
	children: ReactNode;
	/** The part's own styles, so the animated element is the part itself. */
	look?: StyleXStyles;
	ref?: Ref<HTMLSpanElement>;
}) {
	return (
		<AnimatePresence initial={false} mode="popLayout">
			<m.span
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, transition: { duration: 0.1 } }}
				initial={{ opacity: 0, scale: 0.8 }}
				key={change}
				ref={ref}
				transition={{ duration: DISCLOSURE, ease: SPRING }}
				{...props(styles.icon, look)}
			>
				{children}
			</m.span>
		</AnimatePresence>
	);
}

/** A title that rises 3px into place when it changes, such as Running to Ran. */
export function Rise({
	change,
	children,
	look,
}: {
	change: string;
	children: ReactNode;
	/** The part's own styles, so the animated element is the part itself. */
	look?: StyleXStyles;
}) {
	return (
		<AnimatePresence initial={false} mode="popLayout">
			<m.span
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, transition: { duration: 0.1 } }}
				initial={{ opacity: 0, y: 3 }}
				key={change}
				transition={disclosure}
				{...props(styles.text, look)}
			>
				{children}
			</m.span>
		</AnimatePresence>
	);
}

/**
 * Grows in each child added after this list mounted, so the content below
 * slides down instead of jumping. Children it starts with stay still. Each
 * child needs a key.
 */
export function Arrivals({ children }: { children: ReactNode }) {
	return (
		<AnimatePresence initial={false}>
			{Children.toArray(children).map((child) =>
				isValidElement(child) ? (
					<m.div
						animate={{
							height: "auto",
							opacity: 1,
							transitionEnd: { overflow: "visible" },
						}}
						exit={{ height: 0, opacity: 0, overflow: "hidden" }}
						initial={{ height: 0, opacity: 0, overflow: "hidden" }}
						key={child.key}
						transition={disclosure}
					>
						{child}
					</m.div>
				) : null
			)}
		</AnimatePresence>
	);
}
