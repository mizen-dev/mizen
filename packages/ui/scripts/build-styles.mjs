import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import stylex from "@stylexjs/postcss-plugin";
import postcss from "postcss";

const require = createRequire(import.meta.url);
const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));
const config = require("../../../babel.config.js");

// Match the package's Babel transform so shipped class references and CSS agree.
const result = await postcss([
	stylex({
		babelConfig: {
			babelrc: false,
			parserOpts: { plugins: ["typescript", "jsx"] },
			plugins: config.plugins,
		},
		cwd: workspaceRoot,
		include: ["packages/ui/src/**/*.{ts,tsx}"],
	}),
]).process("@stylex;", {
	from: fileURLToPath(new URL("../src/styles.css", import.meta.url)),
});

await writeFile(new URL("../dist/styles.css", import.meta.url), result.css);
