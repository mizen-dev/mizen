import "@mizen/ui/styles.css";
import "./globals.css";
import "@fontsource-variable/wix-madefor-text/wght.css";
import { ThemeProvider, ThemeScript } from "@mizen/ui/theme";

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ThemeScript />
			</head>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
