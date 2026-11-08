"use client";

import { ScrollArea } from "@mizen-labs/ui/scroll-area";
import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { docsStyles } from "../../../shared/ui/docs.styles";
import { wrapIdentifier } from "../../../shared/ui/wrap-identifier";

export interface OutlineSection {
	id: string;
	label: string;
	nested?: boolean;
}

interface TrailPoint {
	halfMarker: number;
	id: string;
	x: number;
	y: number;
}

function trailPath(points: TrailPoint[]) {
	return (
		points
			.map((point, index) => {
				const previous = points[index - 1];
				if (!previous) {
					return `M ${point.x} ${point.y - point.halfMarker} L ${point.x} ${point.y}`;
				}
				if (previous.x === point.x) {
					return `L ${point.x} ${point.y}`;
				}
				const middleY = (previous.y + point.y) / 2;
				const startY = previous.y + previous.halfMarker;
				const endY = point.y - point.halfMarker;
				return `L ${previous.x} ${startY} C ${previous.x} ${middleY} ${point.x} ${middleY} ${point.x} ${endY} L ${point.x} ${point.y}`;
			})
			.join(" ") +
		(points.length
			? ` L ${points.at(-1)?.x} ${(points.at(-1)?.y ?? 0) + (points.at(-1)?.halfMarker ?? 0)}`
			: "")
	);
}

function measureTrail(node: HTMLDivElement) {
	const bounds = node.getBoundingClientRect();
	const points = Array.from(
		node.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
		(link) => {
			const rect = link.getBoundingClientRect();
			const style = getComputedStyle(link);
			return {
				halfMarker: Number.parseFloat(style.fontSize) / 2,
				id: link.hash.slice(1),
				x:
					rect.left - bounds.left - Number.parseFloat(style.paddingInlineStart),
				y: rect.top - bounds.top + rect.height / 2,
			};
		}
	);
	return { height: bounds.height, path: trailPath(points), points };
}

function currentSection(elements: HTMLElement[]) {
	const [first] = elements;
	if (!first) {
		return;
	}
	const offset =
		Number.parseFloat(getComputedStyle(first).scrollMarginBlockStart) + 1;
	if (
		window.scrollY + window.innerHeight >=
		document.documentElement.scrollHeight - 2
	) {
		return elements.at(-1)?.id;
	}
	return (
		elements.findLast(
			(element) => element.getBoundingClientRect().top <= offset
		)?.id ?? elements[0]?.id
	);
}

export function DocumentOutline({ sections }: { sections: OutlineSection[] }) {
	const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);
	const [trail, setTrail] = useState<ReturnType<typeof measureTrail>>();
	const measure = useCallback((node: HTMLDivElement | null) => {
		if (!node) {
			return;
		}
		const observer = new ResizeObserver(() => setTrail(measureTrail(node)));
		observer.observe(node);
		return () => observer.disconnect();
	}, []);
	const activePoint = trail?.points.find(({ id }) => id === activeId);
	const observe = useCallback(
		(node: HTMLElement | null) => {
			if (!node) {
				return;
			}
			const elements = sections.flatMap(({ id }) => {
				const element = document.querySelector<HTMLElement>(
					`#${CSS.escape(id)}`
				);
				return element ? [element] : [];
			});
			let frame = 0;
			const update = () => {
				cancelAnimationFrame(frame);
				frame = requestAnimationFrame(() =>
					setActiveId(currentSection(elements))
				);
			};
			window.addEventListener("scroll", update, { passive: true });
			window.addEventListener("resize", update);
			update();
			return () => {
				cancelAnimationFrame(frame);
				window.removeEventListener("scroll", update);
				window.removeEventListener("resize", update);
			};
		},
		[sections]
	);

	return (
		<nav aria-label="On this page" ref={observe} {...props(docsStyles.outline)}>
			<p {...props(docsStyles.outlineLabel)}>On this page</p>
			<div
				{...props(
					docsStyles.outlineBody(trail?.height ?? sections.length * 40)
				)}
			>
				<ScrollArea overscrollContain scrollbarGutter scrollFade>
					<div ref={measure} {...props(docsStyles.outlineTrail)}>
						{trail ? (
							<svg
								aria-hidden="true"
								height={trail.height}
								{...props(docsStyles.outlineTrack)}
							>
								<path
									d={trail.path}
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									{...props(docsStyles.outlineTrackPath)}
								/>
								{activePoint ? (
									<path
										d={`M ${activePoint.x} ${activePoint.y - activePoint.halfMarker} L ${activePoint.x} ${activePoint.y + activePoint.halfMarker}`}
										strokeLinecap="round"
										{...props(docsStyles.outlineTrackActive)}
									/>
								) : null}
							</svg>
						) : null}
						<ul {...props(docsStyles.outlineList)}>
							{sections.map(({ id, label, nested }) => (
								<li key={id}>
									<a
										aria-current={activeId === id ? "location" : undefined}
										href={`#${id}`}
										{...props(
											docsStyles.outlineLink,
											nested && docsStyles.outlineNested
										)}
									>
										{wrapIdentifier(label)}
									</a>
								</li>
							))}
						</ul>
					</div>
				</ScrollArea>
			</div>
		</nav>
	);
}
