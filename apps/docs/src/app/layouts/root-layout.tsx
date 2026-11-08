import { HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { NextExampleRouter } from "../../shared/lib/next-example-router";
import { useDocumentScroll } from "../lib/use-document-scroll";
import "@mizen-labs/ui/styles.css";
import "../styles/globals.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource-variable/wix-madefor-text/wght.css";
import { colors } from "@mizen-labs/ui/colors.stylex";
import { ThemeProvider, ThemeScript } from "@mizen-labs/ui/theme";
import { AnchoredToastProvider, ToastProvider } from "@mizen-labs/ui/toast";
import { props } from "@stylexjs/stylex";
import { shellStyles } from "../../shared/styles/docs-shell.styles";
import { docsFonts } from "../../shared/styles/fonts.styles";

export const metadata = {
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
	const documentScroll = useDocumentScroll();
	return (
		<html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
			<head>
				<ThemeScript />
				<HeadContent />
				<style>{selectionCss}</style>
			</head>
			<body ref={documentScroll} {...props(docsFonts, shellStyles.canvas)}>
				<ThemeProvider>
					<AnchoredToastProvider>
						<ToastProvider>
							<NextExampleRouter>{children}</NextExampleRouter>
						</ToastProvider>
					</AnchoredToastProvider>
				</ThemeProvider>
				{import.meta.env.DEV ? (
					<TanStackRouterDevtools initialIsOpen={false} />
				) : null}
				<Scripts />
			</body>
		</html>
	);
}
