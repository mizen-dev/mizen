import { create, props } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";

// Shared by Heatmap and CalendarHeatmap: six sequential buckets of one hue,
// mixed from the workarea, plus a separate "missing" color.

const BUCKETS = [0, 1, 2, 3, 4, 5] as const;
export const COLOR_DOMAIN = ["missing", ...BUCKETS] as const;

const styles = create({
	group: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		minInlineSize: 0,
	},
	label: { color: colors.mutedContent },
	legend: {
		alignItems: "center",
		columnGap: space["3"],
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "flex-end",
		marginBlockStart: space["2"],
		rowGap: space["1"],
	},
	swatch: (backgroundColor: string) => ({
		backgroundColor,
		blockSize: space["3"],
		borderRadius: 3,
		flexShrink: 0,
		inlineSize: space["3"],
	}),
});

export function getBucket(value: number, maximum: number) {
	return Math.min(
		BUCKETS.length - 1,
		Math.floor((value / (maximum || 1)) * BUCKETS.length)
	);
}

export function colorRange(tone: ChartSeriesTone) {
	return [
		colors.workarea,
		...BUCKETS.map(
			(bucket) =>
				`color-mix(in oklab, ${colors.workarea} ${100 - ((bucket + 1) / BUCKETS.length) * 100}%, ${chartColors[tone]})`
		),
	];
}

export function HeatmapLegend({
	high,
	tone,
	valueLabel,
}: {
	high: string;
	tone: ChartSeriesTone;
	valueLabel: string;
}) {
	return (
		<div
			aria-label={`${valueLabel} range; No data is shown separately`}
			data-slot="heatmap-legend"
			role="img"
			{...props(styles.legend)}
		>
			<span {...props(styles.group)}>
				<span {...props(typeRoles.caption, styles.label)}>Low 0</span>
				{colorRange(tone)
					.slice(1)
					.map((color) => (
						<span
							aria-hidden="true"
							key={color}
							{...props(styles.swatch(color))}
						/>
					))}
				<span {...props(typeRoles.caption, styles.label)}>High {high}</span>
			</span>
			<span {...props(styles.group)}>
				<span aria-hidden="true" {...props(styles.swatch(colors.workarea))} />
				<span {...props(typeRoles.caption, styles.label)}>No data</span>
			</span>
		</div>
	);
}
