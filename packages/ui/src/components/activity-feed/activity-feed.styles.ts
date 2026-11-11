import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const activityFeedStyles = create({
	content: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		gridColumn: {
			":is([data-slot=activity-feed-item]:has(> [data-slot=activity-feed-media]) > *)": 2,
			default: 1,
		},
		gridRow: 1,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	description: {
		color: colors.mutedContent,
		margin: 0,
		overflowWrap: "anywhere",
	},
	details: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadius,
		color: colors.content,
		marginBlockStart: space["2"],
		minWidth: 0,
		overflowWrap: "anywhere",
		padding: space["3"],
	},
	header: {
		alignItems: "center",
		columnGap: space["3"],
		display: "flex",
		flexWrap: "wrap",
		minHeight: "2.25rem",
		minWidth: 0,
		rowGap: space["1"],
	},
	item: {
		"::before": {
			backgroundColor: colors.border,
			content: {
				":is([data-variant=timeline] > *):has(> [data-slot=activity-feed-media]):not(:last-child)":
					'""',
				default: "none",
			},
			insetBlockEnd: "-0.25rem",
			insetBlockStart: "calc(0.75rem + 2.25rem + 0.5rem)",
			insetInlineStart: "calc(1.125rem - 0.5px)",
			pointerEvents: "none",
			position: "absolute",
			width: borderWidth.thin,
		},
		alignItems: "start",
		borderBlockEndColor: colors.border,
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: {
			":is([data-variant=timeline] > *)": 0,
			":last-child": 0,
			default: borderWidth.thin,
		},
		columnGap: space["3"],
		display: "grid",
		gridTemplateColumns: {
			":has(> [data-slot=activity-feed-media])": "2.25rem minmax(0, 1fr) auto",
			"@container (max-width: 27.999rem)": {
				":has(> [data-slot=activity-feed-media])": "2.25rem minmax(0, 1fr)",
				default: "minmax(0, 1fr)",
			},
			default: "minmax(0, 1fr) auto",
		},
		minWidth: 0,
		paddingBlock: {
			":is([data-variant=timeline] > *)": space["3"],
			default: space["4"],
		},
		position: "relative",
		rowGap: space["1"],
	},
	media: {
		alignItems: "center",
		backgroundColor: colors.controlSurface,
		borderRadius: "50%",
		color: colors.mutedContent,
		display: "flex",
		gridColumn: 1,
		gridRowEnd: "span 2",
		gridRowStart: 1,
		height: "2.25rem",
		justifyContent: "center",
		width: "2.25rem",
	},
	root: { containerType: "inline-size", gap: 0, width: "100%" },
	summary: {
		color: colors.content,
		flexBasis: {
			":is([data-slot=activity-feed-header] > *)": "14rem",
			default: "auto",
		},
		flexGrow: { ":is([data-slot=activity-feed-header] > *)": 1, default: 0 },
		fontWeight: fontWeight.regular,
		margin: 0,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	time: {
		alignSelf: {
			":is([data-slot=activity-feed-header] > *)": "center",
			default: "start",
		},
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
		gridColumn: {
			":is([data-slot=activity-feed-item]:has(> [data-slot=activity-feed-media]) > *)": 3,
			"@container (max-width: 27.999rem)": {
				":is([data-slot=activity-feed-item]:has(> [data-slot=activity-feed-media]) > *)": 2,
				default: 1,
			},
			default: 2,
		},
		gridRow: { "@container (max-width: 27.999rem)": 2, default: 1 },
		minWidth: 0,
		overflowWrap: "anywhere",
	},
});
