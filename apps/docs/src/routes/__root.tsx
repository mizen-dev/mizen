import { createRootRoute, Link } from "@tanstack/react-router";
import RootLayout, { metadata } from "../../app/layout";

export const Route = createRootRoute({
	head: () => ({
		links: [{ href: "/icon.svg", rel: "icon", type: "image/svg+xml" }],
		meta: [
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ title: metadata.title },
			{ content: metadata.description, name: "description" },
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
