import { registerHooks } from "node:module";

// The token modules an application may read, and the name of each group in a
// CSS variable: colors.controlSurfaceHover is
// --mizen-color-control-surface-hover.
const GROUPS = {
	"colors.stylex.js": { colors: "color", fieldColors: "field-color" },
	"dimensions.stylex.js": {
		controlSize: "control-size",
		glyphSize: "glyph-size",
	},
	"fonts.stylex.js": { fonts: "font" },
	"interaction.stylex.js": {
		borderWidth: "border-width",
		focus: "focus",
		opacity: "opacity",
		scale: "scale",
	},
	"motion.stylex.js": { duration: "duration", easing: "easing" },
	"palette.stylex.js": { palette: "palette" },
	"shadows.stylex.js": { shadows: "shadow" },
	"shape.stylex.js": { shape: "shape" },
	"spacing.stylex.js": { space: "space" },
	"typography.stylex.js": {
		fontSize: "font-size",
		fontWeight: "font-weight",
		letterSpacing: "letter-spacing",
		lineHeight: "line-height",
	},
};

const HASHED = /^var\((?<name>--x[\da-z]+)\)$/u;

function kebab(key) {
	return key
		.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)
		.replaceAll(".", "-");
}

// The compiled modules import each other without a file extension, and their
// package does not declare them as ES modules.
registerHooks({
	load(url, context, next) {
		return next(
			url,
			url.endsWith(".stylex.js") ? { ...context, format: "module" } : context
		);
	},
	resolve(specifier, context, next) {
		try {
			return next(specifier, context);
		} catch (error) {
			if (specifier.startsWith(".")) {
				return next(`${specifier}.js`, context);
			}
			throw error;
		}
	},
});

async function readTokens(stylesDirectory) {
	const modules = await Promise.all(
		Object.keys(GROUPS).map((file) => import(new URL(file, stylesDirectory)))
	);
	return Object.values(GROUPS).flatMap((groups, index) =>
		Object.entries(groups).flatMap(([exportName, group]) =>
			Object.entries(modules[index][exportName])
				.filter(([key]) => !key.startsWith("__"))
				.map(([key, value]) => [`--mizen-${group}-${kebab(key)}`, value])
		)
	);
}

const compact = { before: "", between: ":" };

// Moves a themed token's value to its public variable, in the tokens layer.
// The hashed variable then reads the public one. Rules inside an at-rule,
// such as forced colors, keep their own values.
function publishThemed(root, themed, layer, Rule) {
	root.each((rule) => {
		if (rule.type !== "rule") {
			return;
		}
		const published = new Rule({
			raws: { after: "", before: "", between: "", semicolon: false },
			selector: rule.selector,
		});
		rule.each((declaration) => {
			const name = themed.get(declaration.prop);
			// A stylesheet that already went through this step stays as it is.
			if (name && declaration.value !== `var(${name})`) {
				published.append({
					prop: name,
					raws: compact,
					value: declaration.value,
				});
				declaration.value = `var(${name})`;
			}
		});
		if (published.nodes.length > 0) {
			layer.append(published);
		}
	});
}

// Gives every public token a stable CSS variable, --mizen-<group>-<name>.
// They sit in a cascade layer, so an application's own declaration of a themed
// token wins in both themes without matching the library's selectors. A
// constant is set once on the root; components do not read it back.
export async function publicTokens(stylesDirectory) {
	const tokens = await readTokens(stylesDirectory);
	const themed = new Map();
	const constants = [];
	for (const [name, value] of tokens) {
		const hashed = HASHED.exec(String(value))?.groups.name;
		if (hashed) {
			themed.set(hashed, name);
		} else {
			constants.push([name, String(value)]);
		}
	}
	return {
		Once(root, { AtRule, Rule }) {
			const layer = new AtRule({
				name: "layer",
				params: "mizen-tokens",
				raws: { after: "", afterName: " ", between: "" },
			});
			publishThemed(root, themed, layer, Rule);
			const scale = new Rule({
				raws: { after: "", before: "", between: "", semicolon: false },
				selector: ":root",
			});
			for (const [prop, value] of constants) {
				scale.append({ prop, raws: compact, value });
			}
			layer.append(scale);
			root.prepend(layer);
		},
		postcssPlugin: "mizen-public-tokens",
	};
}
