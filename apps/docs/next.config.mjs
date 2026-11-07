import { fileURLToPath } from "node:url";

export default {
	experimental: { cpus: 1 },
	async redirects() {
		return [
			{
				destination: "/docs/components/:slug",
				permanent: true,
				source: "/components/:slug",
			},
			{
				destination: "/docs/components/:slug/markdown",
				permanent: true,
				source: "/components/:slug/markdown",
			},
		];
	},
	transpilePackages: ["@mizen/ui"],
	// The monorepo root, so Turbopack watches packages/ui. StyleX's PostCSS
	// plugin reports those sources as dependencies; outside the root they go
	// unwatched and package style edits never reach the CSS.
	turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
};
