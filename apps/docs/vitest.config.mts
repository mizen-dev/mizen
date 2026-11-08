import { defineConfig } from "vite-plus";

export default defineConfig({
	test: {
		globalSetup: "./tests/global-setup.ts",
		maxWorkers: 1,
		testTimeout: 30_000,
	},
});
