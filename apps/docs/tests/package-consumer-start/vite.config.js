import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tanstackStart(), viteReact()],
	// Mizen imports its own CSS files, so the server bundle must include it.
	ssr: { noExternal: ["@mizen/ui"] },
});
