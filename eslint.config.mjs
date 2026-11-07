import babelParser from "@babel/eslint-parser";
import stylex from "@stylexjs/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

const TYPE_PROPERTY = "/^(fontSize|lineHeight|letterSpacing)$/";

export default [
	{ ignores: ["**/.next/**", "**/dist/**", "**/node_modules/**"] },
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			parser: babelParser,
			parserOptions: {
				babelOptions: {
					babelrc: false,
					configFile: false,
					parserOpts: {
						plugins: ["jsx", "typescript"],
					},
					plugins: [
						"@babel/plugin-syntax-jsx",
						["@babel/plugin-syntax-typescript", { isTSX: true }],
					],
				},
				requireConfigFile: false,
			},
		},
		plugins: { "@stylexjs": stylex },
		rules: {
			"@stylexjs/enforce-extension": "error",
			"@stylexjs/no-conflicting-props": "error",
			"@stylexjs/no-unused": "error",
			"@stylexjs/valid-shorthands": "error",
			"@stylexjs/valid-styles": "error",
			complexity: ["error", { max: 10 }],
		},
	},
	{
		// React's own rules, including the React Compiler's purity and ref checks.
		...reactHooks.configs.flat["recommended-latest"],
		files: ["**/*.{js,jsx,ts,tsx}"],
	},
	{
		// Type comes from typeRoles or the typography tokens, never literals.
		files: ["**/*.{ts,tsx}"],
		ignores: [
			"**/*.stylex.ts",
			"**/tests/**",
			// Marketing scale and the accepted proposal's old-versus-new specimen.
			"**/landing.styles.ts",
		],
		rules: {
			"no-restricted-syntax": [
				"error",
				...[
					`Property[key.name=${TYPE_PROPERTY}] > Literal.value`,
					`Property[key.name=${TYPE_PROPERTY}] > ObjectExpression > Property > Literal.value`,
				].map((selector) => ({
					message:
						"Use typeRoles or the fontSize, lineHeight, and letterSpacing tokens; only inherit and 0 may be literal.",
					selector: `${selector}:not([value="inherit"]):not([value=0])`,
				})),
			],
		},
	},
];
