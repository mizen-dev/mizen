"use client";

import { create, props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { colors } from "../../styles/colors.stylex";
import { duration } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";
import { typeRoles } from "../../styles/typography.styles";
import { fontWeight } from "../../styles/typography.stylex";
import { assertIdentity, assertNonNegative } from "../chart-frame/chart-assert";
import { chartColors } from "../chart-frame/chart-colors";
import { ChartDataTable } from "../chart-frame/chart-data-table";
import { ChartHoverTooltip, useChartHover } from "../chart-frame/chart-hover";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "../table/table";
import {
	layoutSankey,
	type PlacedNode,
	ribbonPath,
	type SankeyLink,
	type SankeyNode,
} from "./sankey-layout";

export type { SankeyLink, SankeyNode } from "./sankey-layout";

export type SankeyChartProps = Omit<
	Closed<ComponentPropsWithRef<"figure">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	formatValue?: (value: number) => string;
	links: readonly SankeyLink[];
	locale?: string;
	/** Up to six sources on the left; each colors its ribbons. */
	sources: readonly SankeyNode[];
	/** Targets on the right, drawn in the neutral reference tone. */
	targets: readonly SankeyNode[];
};

const NAME = "SankeyChart";
const TONES = [
	"series1",
	"series2",
	"series3",
	"series4",
	"series5",
	"series6",
] as const;
const HEIGHT = 320;
const PADDING = 12;
const NODE = 8;
const RIBBON_WIDTH = 1000;

const styles = create({
	bar: (top: number, blockSize: number, backgroundColor: string) => ({
		backgroundColor,
		blockSize: Math.max(blockSize, 2),
		borderRadius: 3,
		insetBlockStart: top,
		insetInline: 0,
		position: "absolute",
	}),
	// Bars stay square where their ribbons attach, rounded on the free side.
	barSource: { borderEndEndRadius: 0, borderStartEndRadius: 0 },
	barTarget: { borderEndStartRadius: 0, borderStartStartRadius: 0 },
	column: { blockSize: HEIGHT, minWidth: 0, position: "relative" },
	label: (top: number) => ({
		insetBlockStart: top,
		insetInline: 0,
		overflow: "hidden",
		position: "absolute",
		textOverflow: "ellipsis",
		transform: "translateY(-50%)",
		whiteSpace: "nowrap",
	}),
	labelEnd: { paddingInlineEnd: space["2"], textAlign: "end" },
	labelStart: { paddingInlineStart: space["2"] },
	muted: { color: colors.mutedContent },
	name: { color: colors.content, fontWeight: fontWeight.medium },
	// Bars touch their ribbons; only the label columns carry padding. Label
	// columns take their text width up to 35%, then truncate, so narrow charts
	// keep the ribbons; tooltips and the data table carry full labels.
	plot: {
		display: "grid",
		gridTemplateColumns: `fit-content(35%) ${NODE}px minmax(4rem, 1fr) ${NODE}px fit-content(35%)`,
	},
	ribbon: {
		opacity: 0.32,
		transitionDuration: duration.fast,
		transitionProperty: "opacity",
	},
	// The hovered flow, or every flow through a hovered node, comes forward.
	ribbonFaint: { opacity: 0.08 },
	ribbonStrong: { opacity: 0.64 },
	root: { margin: 0, minWidth: 0 },
	// An invisible in-flow copy of the labels gives the column its width.
	sizer: {
		blockSize: 0,
		overflow: "hidden",
		visibility: "hidden",
		whiteSpace: "nowrap",
	},
	svg: { blockSize: HEIGHT, display: "block", inlineSize: "100%" },
});

function assertNodes(
	sources: readonly SankeyNode[],
	targets: readonly SankeyNode[]
) {
	if (
		!Array.isArray(sources) ||
		sources.length === 0 ||
		sources.length > TONES.length
	) {
		throw new RangeError(`${NAME} needs one to six sources.`);
	}
	if (!Array.isArray(targets) || targets.length === 0) {
		throw new RangeError(`${NAME} needs at least one target.`);
	}
	const sourceIds = new Set<string>();
	const targetIds = new Set<string>();
	for (const node of sources) {
		assertIdentity(NAME, node, sourceIds);
	}
	for (const node of targets) {
		assertIdentity(NAME, node, targetIds);
	}
	return { sourceIds, targetIds };
}

function assertInput(
	sources: readonly SankeyNode[],
	targets: readonly SankeyNode[],
	links: readonly SankeyLink[]
) {
	const { sourceIds, targetIds } = assertNodes(sources, targets);
	if (!Array.isArray(links)) {
		throw new TypeError(`${NAME} links must be an array.`);
	}
	for (const { source, target, value } of links) {
		if (!(sourceIds.has(source) && targetIds.has(target))) {
			throw new RangeError(
				`${NAME} links must join a known source and target.`
			);
		}
		assertNonNegative(NAME, value);
	}
}

function NodeLabels({
	align,
	nodes,
}: {
	align: "end" | "start";
	nodes: readonly (PlacedNode & { detail: string })[];
}) {
	const side = align === "end" ? styles.labelEnd : styles.labelStart;
	const text = (node: PlacedNode & { detail: string }) => (
		<>
			<span {...props(styles.name)}>{node.label}</span>
			<span {...props(styles.muted)}> {node.detail}</span>
		</>
	);
	return (
		<div aria-hidden="true" {...props(styles.column)}>
			<div {...props(styles.sizer, side)}>
				{nodes.map((node) => (
					<div key={node.id}>{text(node)}</div>
				))}
			</div>
			{nodes.map((node) => (
				<div
					key={node.id}
					{...props(styles.label(node.top + node.height / 2), side)}
				>
					{text(node)}
				</div>
			))}
		</div>
	);
}

/** Flows from up to six sources to their targets, one ribbon per link. */
export function SankeyChart({
	"aria-label": ariaLabel,
	formatValue,
	links,
	locale = "en-US",
	ref: forwardedRef,
	sources,
	targets,
	...rest
}: SankeyChartProps) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError(`${NAME} requires a non-empty aria-label.`);
	}
	assertInput(sources, targets, links);
	for (const name of [
		"aria-label",
		"children",
		"className",
		"data-slot",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(rest, name);
	}
	const format = formatValue ?? new Intl.NumberFormat(locale).format;
	const share = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 0,
		style: "percent",
	});
	const layout = layoutSankey(sources, targets, links, HEIGHT, PADDING);
	const tones = new Map(
		sources.map(({ id }, index) => [id, chartColors[TONES[index]]])
	);
	const labels = new Map(
		[...sources, ...targets].map(({ id, label }) => [id, label])
	);
	const toneKeys = new Map(sources.map(({ id }, index) => [id, TONES[index]]));
	const hover = useChartHover();
	const { active, hostRef, hostStyle, linkProps, markProps } = hover;
	const ribbonEmphasis = ({ source, target }: SankeyLink) => {
		if (active === null) {
			return null;
		}
		const touched = [`${source}:${target}`, source, target].includes(active);
		return touched ? styles.ribbonStrong : styles.ribbonFaint;
	};

	return (
		<figure
			{...rest}
			aria-label={ariaLabel}
			data-slot="sankey-chart"
			ref={forwardedRef}
			{...props(styles.root, typeRoles.ui)}
		>
			<div ref={hostRef} {...props(styles.plot, hostStyle)}>
				<NodeLabels
					align="end"
					nodes={layout.left.map((node) => ({
						...node,
						detail: format(node.value),
					}))}
				/>
				<div aria-hidden="true" {...props(styles.column)}>
					{layout.left.map(({ height, id, top }) => (
						<span
							key={id}
							{...linkProps(id)}
							{...props(
								styles.bar(top, height, tones.get(id) ?? ""),
								styles.barSource
							)}
						/>
					))}
				</div>
				<svg
					aria-hidden="true"
					preserveAspectRatio="none"
					viewBox={`0 0 ${RIBBON_WIDTH} ${HEIGHT}`}
					{...props(styles.svg)}
				>
					{layout.links.map((link) => (
						<path
							d={ribbonPath(link, RIBBON_WIDTH)}
							fill={tones.get(link.source)}
							key={`${link.source}:${link.target}`}
							{...markProps(`${link.source}:${link.target}`, {
								items: [
									{
										id: link.target,
										label: labels.get(link.target),
										tone: toneKeys.get(link.source) ?? "series1",
										value: format(link.value),
									},
								],
								label: `${labels.get(link.source)} →`,
							})}
							{...props(styles.ribbon, ribbonEmphasis(link))}
						/>
					))}
				</svg>
				<div aria-hidden="true" {...props(styles.column)}>
					{layout.right.map(({ height, id, top }) => (
						<span
							key={id}
							{...linkProps(id)}
							{...props(
								styles.bar(top, height, colors.chartReference),
								styles.barTarget
							)}
						/>
					))}
				</div>
				<NodeLabels
					align="start"
					nodes={layout.right.map((node) => ({
						...node,
						detail: `· ${share.format(node.value / (layout.total || 1))}`,
					}))}
				/>
				<ChartHoverTooltip hover={hover.hover} />
			</div>
			<ChartDataTable>
				<TableContainer aria-label={`${ariaLabel} data`}>
					<Table>
						<TableCaption>{ariaLabel} flows</TableCaption>
						<TableHeader sticky={false}>
							<TableRow>
								<TableHead scope="col">From</TableHead>
								<TableHead scope="col">To</TableHead>
								<TableHead scope="col">Value</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{layout.links.map(({ source, target, value }) => (
								<TableRow key={`${source}:${target}`}>
									<TableCell>{labels.get(source)}</TableCell>
									<TableCell>{labels.get(target)}</TableCell>
									<TableCell numeric>{format(value)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</ChartDataTable>
		</figure>
	);
}
