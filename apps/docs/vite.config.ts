import { createRequire } from "node:module";
import babel from "@rolldown/plugin-babel";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

import { componentDocs } from "./app/docs-registry";
import { guides } from "./app/guides";

const require = createRequire(import.meta.url);
const babelConfig = require("../../babel.config.js");

export default defineConfig({
	plugins: [
		tanstackStart({
			importProtection: { behavior: "error" },
			pages: [
				"/",
				"/docs",
				...guides.map(({ slug }) => `/docs/${slug}`),
				...componentDocs.map(({ slug }) => `/docs/components/${slug}`),
			].map((path) => ({ path })),
			prerender: {
				autoStaticPathsDiscovery: false,
				concurrency: 4,
				crawlLinks: false,
				enabled: true,
				failOnError: true,
			},
		}),
		nitro({ features: { fastResponse: false }, preset: "node-server" }),
		react(),
		babel({ plugins: babelConfig.plugins }),
	],
	resolve: { dedupe: ["react", "react-dom"] },
	server: { port: 3000, watch: { ignored: ["**/.output/**"] } },
	ssr: { noExternal: ["@mizen-labs/ui"] },
});
