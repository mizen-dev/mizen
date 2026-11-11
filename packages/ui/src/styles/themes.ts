import { createTheme } from "@stylexjs/stylex";
import { colors, fieldColors } from "./colors.stylex";

const darkColorTheme = createTheme(colors, {
	accent: "oklch(0.55 0.19 5)",
	accentContent: "oklch(1 0 0)",
	backdrop: "oklch(0 0 0)",
	border: "oklch(1 0 0 / 0.10)",
	brandBackground: "oklch(0.235 0.045 325)",
	brandForeground: "oklch(0.9 0.055 315)",
	// Reference series such as last year: quieter than the palette, 3:1 on the workarea.
	chartReference: "oklch(0.55 0 0)",
	// Same hue order at the dark band (L 0.64); all clear 3:1 on the dark workarea.
	chartSeries1: "oklch(0.64 0.22 300)",
	chartSeries2: "oklch(0.64 0.135 75)",
	chartSeries3: "oklch(0.64 0.22 352)",
	chartSeries4: "oklch(0.64 0.175 132)",
	chartSeries5: "oklch(0.64 0.195 255)",
	chartSeries6: "oklch(0.64 0.13 165)",
	content: "oklch(0.94 0 0)",
	controlBorder: "oklch(0.28 0 0)",
	controlBorderStrong: "oklch(0.55 0 0)",
	controlIndicator: "oklch(0.31 0 0)",
	controlSurface: "oklch(0.235 0 0)",
	controlSurfaceDisabled: "oklch(0.205 0 0)",
	controlSurfaceHover: "oklch(0.265 0 0)",
	controlThumb: "oklch(0.96 0 0)",
	destructive: "oklch(0.70 0.18 25)",
	destructiveContent: "oklch(0.17 0 0)",
	destructiveSubtle: "oklch(0.27 0.07 25)",
	destructiveText: "oklch(0.83 0.094 25)",
	floatingHighlight: "oklch(0.31 0 0)",
	floatingSurface: "oklch(0.235 0 0)",
	focusRing: "oklch(0.72 0.13 0)",
	info: "oklch(0.32 0.06 240)",
	infoContent: "oklch(0.93 0.03 240)",
	infoSolid: "oklch(0.72 0.13 245)",
	mutedContent: "oklch(0.74 0 0)",
	outlineSurface: "oklch(0.215 0 0)",
	primary: "oklch(0.94 0 0)",
	primaryContent: "oklch(0.17 0 0)",
	secondary: "oklch(0.25 0 0)",
	secondaryContent: "oklch(0.94 0 0)",
	selected: "oklch(0.29 0 0)",
	success: "oklch(0.34 0.06 145)",
	successContent: "oklch(0.93 0.03 145)",
	successSolid: "oklch(0.72 0.16 148)",
	surface: "oklch(0.17 0 0)",
	switchTrackChecked: "oklch(0.55 0.19 5)",
	warning: "oklch(0.36 0.06 85)",
	warningContent: "oklch(0.95 0.03 85)",
	warningSolid: "oklch(0.80 0.14 75)",
	workarea: "oklch(0.205 0 0)",
	workareaControlSurface: "oklch(0.235 0 0)",
});

const darkFieldTheme = createTheme(fieldColors, {
	disabled: colors.controlSurfaceDisabled,
	surface: colors.surface,
});

export const darkTheme = [darkColorTheme, darkFieldTheme] as const;
