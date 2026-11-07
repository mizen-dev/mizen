import "@mizen-labs/ui/styles.css";
import "./globals.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource-variable/wix-madefor-text/wght.css";
import { colors } from "@mizen-labs/ui/colors.stylex";
import { ThemeProvider, ThemeScript } from "@mizen-labs/ui/theme";
import { AnchoredToastProvider, ToastProvider } from "@mizen-labs/ui/toast";
import { props } from "@stylexjs/stylex";
import type { Metadata } from "next";
import { shellStyles } from "./docs-shell.styles";
import { docsFonts } from "./fonts.styles";

export const metadata: Metadata = {
	description:
		"Mizen UI components, documentation, blocks, and application examples.",
	title: "Mizen UI",
};

// Lavender for selection, as the palette says, with wine text. The values are
// the theme's own variables, so the dark theme applies without extra rules.
const selectionCss = `::selection { background-color: ${colors.brandBackground}; color: ${colors.brandForeground}; }`;

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
			<head>
				<ThemeScript />
				<style>{selectionCss}</style>
			</head>
			<body {...props(docsFonts, shellStyles.canvas)}>
				<ThemeProvider>
					<AnchoredToastProvider>
						<ToastProvider>{children}</ToastProvider>
					</AnchoredToastProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
