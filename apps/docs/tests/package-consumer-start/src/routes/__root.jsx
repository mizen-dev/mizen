import fontCss from "@fontsource-variable/wix-madefor-text/wght.css?url";
import mizenCss from "@mizen/ui/styles.css?url";
import { ThemeProvider, ThemeScript } from "@mizen/ui/theme";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		links: [
			{ href: mizenCss, rel: "stylesheet" },
			{ href: fontCss, rel: "stylesheet" },
			{ href: appCss, rel: "stylesheet" },
		],
		meta: [
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ title: "Mizen on TanStack Start" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			{/* biome-ignore lint/style/noHeadElement: TanStack Start renders the document head in its root route; the rule targets Next. */}
			<head>
				<ThemeScript />
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
