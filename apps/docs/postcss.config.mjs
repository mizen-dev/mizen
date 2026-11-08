import { createRequire } from "node:module";
import path from "node:path";
import stylex from "@stylexjs/postcss-plugin";
import lightningcss from "postcss-lightningcss";

const require = createRequire(import.meta.url);
const babelConfig = require("../../babel.config.js");
const workspaceRoot = path.resolve(import.meta.dirname, "../..");
const stylexAssets = /\/(?:app\/globals|ui\/dist\/styles)\.css$/u;
const normalize = lightningcss({ lightningcssOptions: { minify: false } });

export default {
	plugins: [
		stylex({
			babelConfig: {
				babelrc: false,
				parserOpts: { plugins: ["typescript", "jsx"] },
				plugins: babelConfig.plugins,
			},
			cwd: workspaceRoot,
			include: ["packages/ui/src/**/*.{ts,tsx}", "apps/docs/app/**/*.{ts,tsx}"],
		}),
		{
			// Match Next and Vite production handling of numeric StyleX lengths.
			// Leave font stylesheets to Vite's URL rewriter.
			OnceExit(root, context) {
				if (
					stylexAssets.test(root.source.input.file.split(path.sep).join("/"))
				) {
					normalize.OnceExit(root, context);
				}
			},
			postcssPlugin: "mizen-normalize-stylex",
		},
	],
};
