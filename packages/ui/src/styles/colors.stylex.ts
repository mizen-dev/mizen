import { defineVars } from "@stylexjs/stylex";

export const colors = defineVars({
	accent: "oklch(0.42 0.17 0)",
	accentContent: "oklch(1 0 0)",
	backdrop: "oklch(0 0 0)",
	border: "rgb(15 13 10 / 0.06)",
	brandBackground: "oklch(0.96 0.035 315)",
	brandForeground: "oklch(0.42 0.17 0)",
	// Reference series such as last year: quieter than the palette, 3:1 on the workarea.
	chartReference: "oklch(0.62 0.015 285)",
	// Categorical chart hues, violet first, in a fixed order validated for
	// colorblind separation (adjacent ΔE ≥ 13.5) and 3:1 against the workarea.
	// Reorder or retune only by re-running the validation.
	chartSeries1: "oklch(0.66 0.21 300)",
	chartSeries2: "oklch(0.65 0.135 75)",
	chartSeries3: "oklch(0.66 0.22 352)",
	chartSeries4: "oklch(0.63 0.175 132)",
	chartSeries5: "oklch(0.645 0.19 255)",
	chartSeries6: "oklch(0.63 0.13 165)",
	content: "oklch(0.204627 0 0)",
	controlBorderStrong: "oklch(0.62 0.015 285)",
	controlSurface: "oklch(0.94 0.003 285)",
	controlSurfaceDisabled: "oklch(0.97 0.003 285)",
	controlSurfaceHover: "oklch(0.925 0.003 285)",
	controlThumb: "oklch(1 0 0)",
	controlThumbContent: "oklch(0.50 0.015 285)",
	destructive: "oklch(58% 0.237 25.331)",
	destructiveContent: "oklch(1 0 0)",
	destructiveSubtle: "oklch(97% 0.02 25.331)",
	// Error text at 12–14px, unlike the destructive fill used for actions and
	// borders: APCA Lc ≥ 75 in light; the dark theme trades to Lc 70 for hue.
	destructiveText: "oklch(0.49 0.19 25)",
	floatingHighlight: "oklch(0.95 0.004 285)",
	floatingSurface: "oklch(1 0 0)",
	// 60% keeps the ring at 3:1 against surface and workarea (WCAG 1.4.11).
	focusRing: "oklch(0.42 0.17 0 / 0.6)",
	info: "oklch(0.91 0.04 240)",
	infoContent: "oklch(0.26 0.06 245)",
	// Secondary text at 12–16px and placeholders: APCA Lc ≥ 75 on surface and
	// workarea in light, about 70 in dark (kept below content so placeholders
	// stay distinct from values).
	mutedContent: "oklch(0.46 0.015 285)",
	primary: "oklch(0.204627 0 0)",
	primaryContent: "oklch(1 0 0)",
	secondary: "oklch(0.966956 0.004 315)",
	secondaryContent: "oklch(0.204627 0 0)",
	success: "oklch(0.90 0.06 145)",
	successContent: "oklch(0.25 0.06 145)",
	// Status marks such as dots: 3:1 against surface and workarea (WCAG 1.4.11).
	successSolid: "oklch(0.60 0.16 148)",
	surface: "oklch(1 0 0)",
	switchTrackChecked: "oklch(0.42 0.17 0)",
	warning: "oklch(0.92 0.06 85)",
	warningContent: "oklch(0.25 0.05 85)",
	warningSolid: "oklch(0.63 0.15 70)",
	workarea: "oklch(0.975 0.003 285)",
	workareaControlSurface: "oklch(0.94 0.003 285)",
});

export const fieldColors = defineVars({
	disabled: colors.controlSurfaceDisabled,
	surface: colors.controlSurface,
});
