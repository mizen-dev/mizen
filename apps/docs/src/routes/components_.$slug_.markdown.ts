import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/components_/$slug_/markdown")({
	beforeLoad: ({ params, location }) => {
		throw redirect({
			href: `/docs/components/${encodeURIComponent(params.slug)}/markdown${location.searchStr}${location.hash ? `#${location.hash}` : ""}`,
			statusCode: 308,
		});
	},
});
