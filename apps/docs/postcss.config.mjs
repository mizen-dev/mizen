import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const babelConfig = require("./babel.config.js");

const workspaceRoot = path.resolve(process.cwd(), "../..");

export default {
	plugins: {
		"@stylexjs/postcss-plugin": {
			babelConfig: {
				babelrc: false,
				parserOpts: { plugins: ["typescript", "jsx"] },
				plugins: babelConfig.plugins,
			},
			cwd: workspaceRoot,
			include: ["packages/ui/src/**/*.{ts,tsx}", "apps/docs/app/**/*.{ts,tsx}"],
		},
	},
};
