import { createRequire } from "node:module";
import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

import { appDocs } from "./src/entities/documentation/model/apps";
import { componentDocs } from "./src/entities/documentation/model/docs-registry";
import { guides } from "./src/entities/documentation/model/guides";

const require = createRequire(import.meta.url);
const babelConfig = require("../../babel.config.js");

export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			importProtection: { behavior: "error" },
			pages: [
				"/",
				"/docs",
				...guides.map(({ slug }) => `/docs/${slug}`),
				...componentDocs.map(({ slug }) => `/docs/components/${slug}`),
				"/apps",
				...appDocs.map(({ slug }) => `/apps/${slug}`),
			].map((path) => ({ path })),
			prerender: {
				autoStaticPathsDiscovery: false,
				concurrency: 4,
				crawlLinks: false,
				enabled: true,
				failOnError: true,
			},
			srcDirectory: "src/app",
		}),
		react(),
		babel({ plugins: babelConfig.plugins }),
	],
	resolve: { dedupe: ["react", "react-dom"] },
	// Dev and preview must let the docs endpoints answer OPTIONS themselves.
	server: { cors: { preflightContinue: true }, port: 3000 },
	ssr: { noExternal: ["@mizen-labs/ui"] },
});
