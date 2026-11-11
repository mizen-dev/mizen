import { createRequire } from "node:module";
import path from "node:path";
import stylex from "@stylexjs/postcss-plugin";
import lightningcss from "postcss-lightningcss";
import { publicTokens } from "../../packages/ui/scripts/public-tokens.mjs";

const require = createRequire(import.meta.url);
const babelConfig = require("../../babel.config.js");
const workspaceRoot = path.resolve(import.meta.dirname, "../..");
const stylexAssets = /\/(?:src\/app\/styles\/globals|ui\/dist\/styles)\.css$/u;
const normalize = lightningcss({ lightningcssOptions: { minify: false } });
const globals = /\/src\/app\/styles\/globals\.css$/u;
// The docs compile the library source, so they publish the token variables
// the same way the package stylesheet does.
const tokens = await publicTokens(
	new URL("../../packages/ui/dist/styles/", import.meta.url)
);

export default {
	plugins: [
		stylex({
			babelConfig: {
				babelrc: false,
				parserOpts: { plugins: ["typescript", "jsx"] },
				plugins: babelConfig.plugins,
			},
			cwd: workspaceRoot,
			include: ["packages/ui/src/**/*.{ts,tsx}", "apps/docs/src/**/*.{ts,tsx}"],
		}),
		{
			Once(root, helpers) {
				if (globals.test(root.source.input.file.split(path.sep).join("/"))) {
					tokens.Once(root, helpers);
				}
			},
			postcssPlugin: "mizen-docs-public-tokens",
		},
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
