module.exports = {
	// The package ships plain JavaScript: bundlers such as Vite do not compile
	// JSX inside node_modules. Apps that reuse the plugins keep their own JSX setup.
	overrides: [
		{
			plugins: [
				["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
			],
			test: "./packages/ui/src",
		},
	],
	plugins: [
		"@babel/plugin-syntax-jsx",
		["@babel/plugin-syntax-typescript", { isTSX: true }],
		"@babel/plugin-transform-typescript",
		[
			"@stylexjs/babel-plugin",
			{
				dev: process.env.NODE_ENV === "development",
				genConditionalClasses: true,
				runtimeInjection: false,
				treeshakeCompensation: true,
				unstable_moduleResolution: {
					rootDir: __dirname,
					type: "commonJS",
				},
			},
		],
	],
};
