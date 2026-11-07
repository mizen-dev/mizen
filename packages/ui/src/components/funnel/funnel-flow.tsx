import { create, props } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { typeRoles } from "../../styles/typography.styles";
import { fontWeight } from "../../styles/typography.stylex";
import { chartColors } from "../chart-frame/chart-colors";
import { ChartHoverTooltip, useChartHover } from "../chart-frame/chart-hover";
import type { PlacedFunnelStage } from "./funnel";

const HEIGHT = 160;
const STAGE = 100;
// Each stage holds its height for 60% of its width, then eases to the next.
const HOLD = 0.6;
const HALO_OPACITY = 0.16;

const styles = create({
	figure: { blockSize: HEIGHT, position: "relative" },
	pill: (left: string) => ({
		backgroundColor: colors.surface,
		borderRadius: "999px",
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		insetBlockStart: "50%",
		insetInlineStart: left,
		paddingBlock: "0.125rem",
		paddingInline: space["2"],
		position: "absolute",
		transform: "translate(-50%, -50%)",
	}),
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		minWidth: 0,
	},
	svg: { blockSize: HEIGHT, display: "block", inlineSize: "100%" },
	swatch: (backgroundColor: string) => ({
		backgroundColor,
		blockSize: "0.625rem",
		borderRadius: 3,
		flexShrink: 0,
		inlineSize: "0.625rem",
	}),
	tile: {
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minWidth: 0,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	tileLabel: { color: colors.mutedContent },
	tileName: { alignItems: "center", display: "flex", gap: space["2"] },
	tiles: (count: number) => ({
		display: "grid",
		gap: space["2"],
		// One column per stage when each gets 7rem; fewer, wrapped, below that.
		gridTemplateColumns: `repeat(auto-fit, minmax(max(7rem, (100% - ${count - 1} * ${space["2"]}) / ${count}), 1fr))`,
		listStyle: "none",
		margin: 0,
		padding: 0,
	}),
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
	},
});

// One stage's shape: it holds its height, then eases to the next stage's.
function stagePath(heights: readonly number[], index: number) {
	const center = HEIGHT / 2;
	const x0 = index * STAGE;
	const x1 = x0 + STAGE;
	const hold = x0 + STAGE * HOLD;
	const mid = (hold + x1) / 2;
	const half = heights[index] / 2;
	const next = (heights[index + 1] ?? heights[index]) / 2;
	return [
		`M${x0},${center - half} L${hold},${center - half}`,
		`C${mid},${center - half} ${mid},${center - next} ${x1},${center - next}`,
		`L${x1},${center + next}`,
		`C${mid},${center + next} ${mid},${center + half} ${hold},${center + half}`,
		`L${x0},${center + half} Z`,
	].join(" ");
}

export function FunnelFlow({
	"aria-label": ariaLabel,
	format,
	share,
	stages,
}: {
	"aria-label": string;
	format: (value: number) => string;
	share: Intl.NumberFormat;
	stages: readonly PlacedFunnelStage[];
}) {
	const { fade, hostRef, hostStyle, hover, linkProps, markProps } =
		useChartHover();
	const heights = stages.map(({ share: stageShare }) =>
		Math.max(4, stageShare * HEIGHT * 0.78)
	);
	const halo = heights.map((height) => Math.min(HEIGHT, height * 1.12 + 10));
	return (
		<div data-slot="funnel-flow" {...props(styles.root)}>
			<div ref={hostRef} {...props(styles.figure, hostStyle)}>
				<svg
					aria-hidden="true"
					preserveAspectRatio="none"
					viewBox={`0 0 ${stages.length * STAGE} ${HEIGHT}`}
					{...props(styles.svg)}
				>
					{stages.map(
						({ id, label, share: stageShare, tone, value }, index) => (
							<g
								key={id}
								{...markProps(id, {
									items: [
										{
											id,
											label,
											tone,
											value: `${format(value)} · ${share.format(stageShare)}`,
										},
									],
								})}
								{...props(...fade(id))}
							>
								<path
									d={stagePath(halo, index)}
									fill={chartColors[tone]}
									fillOpacity={HALO_OPACITY}
								/>
								<path d={stagePath(heights, index)} fill={chartColors[tone]} />
							</g>
						)
					)}
					{/* Thin surface lines mark where each stage begins. */}
					{stages.slice(1).map(({ id }, index) => (
						<line
							key={id}
							stroke={colors.surface}
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
							x1={(index + 1) * STAGE}
							x2={(index + 1) * STAGE}
							y1={0}
							y2={HEIGHT}
						/>
					))}
				</svg>
				{stages.map(({ id, share: stageShare }, index) => (
					<span
						aria-hidden="true"
						key={id}
						{...props(
							styles.pill(`${((index + HOLD / 2) / stages.length) * 100}%`),
							typeRoles.caption
						)}
					>
						{share.format(stageShare)}
					</span>
				))}
				<ChartHoverTooltip hover={hover} />
			</div>
			<ol aria-label={ariaLabel} {...props(styles.tiles(stages.length))}>
				{stages.map(({ id, label, share: stageShare, tone, value }) => (
					<li
						data-slot="funnel-stage"
						key={id}
						{...linkProps(id)}
						{...props(styles.tile, ...fade(id))}
					>
						<span {...props(styles.tileName, styles.tileLabel)}>
							<span
								aria-hidden="true"
								{...props(styles.swatch(chartColors[tone]))}
							/>
							{label}
						</span>
						<span>
							<span {...props(styles.value)}>{format(value)}</span>
							<span {...props(styles.tileLabel, typeRoles.caption)}>
								{" "}
								{share.format(stageShare)}
							</span>
						</span>
					</li>
				))}
			</ol>
		</div>
	);
}
