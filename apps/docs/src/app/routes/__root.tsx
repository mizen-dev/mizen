import sansFontUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { createRootRoute, Link } from "@tanstack/react-router";
import { loadNavigation } from "../../entities/documentation/api/docs-functions";
import RootLayout from "../layouts/root-layout";

export const Route = createRootRoute({
	loader: () => loadNavigation(),
	staleTime: import.meta.env.DEV ? 0 : Number.POSITIVE_INFINITY,
	head: () => ({
		links: [
			{ href: "/icon.svg", rel: "icon", type: "image/svg+xml" },
			{
				as: "font",
				crossOrigin: "anonymous",
				href: sansFontUrl,
				rel: "preload",
				type: "font/woff2",
			},
		],
		meta: [
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ title: "Mizen UI" },
			{
				content:
					"Mizen UI components, documentation, blocks, and application examples.",
				name: "description",
			},
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootLayout,
});

function NotFound() {
	return (
		<main id="docs-content">
			<h1>Page not found</h1>
			<Link to="/docs">Browse documentation</Link>
		</main>
	);
}
