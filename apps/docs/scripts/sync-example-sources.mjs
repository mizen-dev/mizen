import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseForESLint } from "@babel/eslint-parser";
import { collectAnatomy } from "./component-anatomy.mjs";

const EXPORT_PREFIX = /^export /u;
const appRoot = fileURLToPath(new URL("../src/", import.meta.url));
const registryPath = resolve(
	appRoot,
	"entities/documentation/ui/specimens/index.ts"
);
const outputPath = resolve(
	appRoot,
	"entities/documentation/model/example-sources.json"
);

function parseSource(code) {
	return parseForESLint(code, {
		babelOptions: {
			babelrc: false,
			configFile: false,
			parserOpts: { plugins: ["typescript", "jsx"] },
		},
		requireConfigFile: false,
	}).ast;
}

function readModule(path) {
	const code = readFileSync(path, "utf8");
	return { code, statements: parseSource(code).body };
}

function collectPackageExports() {
	const packageRoot = resolve(appRoot, "../../../packages/ui");
	const manifest = JSON.parse(
		readFileSync(resolve(packageRoot, "package.json"), "utf8")
	);
	const sources = Object.values(manifest.exports)
		.filter((entry) => typeof entry === "object" && entry.source)
		.map((entry) => entry.source);
	return new Set(
		sources.flatMap((source) => {
			const { statements } = readModule(resolve(packageRoot, source));
			return statements
				.filter((node) => node.type === "ExportNamedDeclaration")
				.flatMap((node) =>
					node.declaration?.id?.name
						? [node.declaration.id.name]
						: node.specifiers.map(({ exported }) => exported.name)
				);
		})
	);
}

function resolveModule(owner, specifier) {
	const base = resolve(dirname(owner), specifier);
	const path = [".ts", ".tsx", "/index.ts", "/index.tsx"]
		.map((extension) => `${base}${extension}`)
		.find(existsSync);
	if (!path?.startsWith(appRoot)) {
		throw new Error(
			`Cannot publish example dependency ${specifier} in ${owner}`
		);
	}
	return path;
}

function visitSource(path, paths, files) {
	const key = relative(appRoot, path);
	if (paths.includes(key)) {
		return;
	}
	paths.push(key);
	const { code, statements } = readModule(path);
	files[key] = code;
	for (const node of statements.filter((item) =>
		item.source?.value?.startsWith(".")
	)) {
		visitSource(resolveModule(path, node.source.value), paths, files);
	}
}

function collectExampleSources() {
	const { statements } = readModule(registryPath);
	const imports = new Map();
	for (const statement of statements.filter(
		(node) =>
			node.type === "ImportDeclaration" && node.source.value.startsWith(".")
	)) {
		for (const specifier of statement.specifiers) {
			imports.set(
				specifier.local.name,
				resolveModule(registryPath, statement.source.value)
			);
		}
	}
	const declaration = statements.find(
		(node) =>
			node.type === "ExportNamedDeclaration" &&
			node.declaration?.declarations?.[0]?.id.name === "specimenRegistry"
	)?.declaration.declarations[0];
	if (!declaration) {
		throw new Error("Specimen registry not found");
	}
	const files = {};
	const entries = {};
	for (const property of declaration.init.properties) {
		const slug = property.key.value ?? property.key.name;
		const path = imports.get(property.value.name);
		if (!path) {
			throw new Error(`Missing source for ${slug}`);
		}
		const paths = [];
		visitSource(path, paths, files);
		entries[slug] = { exportName: property.value.name, files: paths };
	}
	const usage = collectUsageSources();
	return {
		components: collectAnatomy({
			docs: JSON.parse(
				readFileSync(
					resolve(
						appRoot,
						"entities/documentation/model/docs-registry-data.json"
					),
					"utf8"
				)
			),
			exports: collectPackageExports(),
			parse: parseSource,
			usage,
		}),
		entries,
		files,
		usage,
	};
}

function collectUsageSources() {
	const registry = JSON.parse(
		readFileSync(
			resolve(appRoot, "entities/documentation/ui/examples/registry.json"),
			"utf8"
		)
	);
	return Object.fromEntries(
		Object.entries(registry).map(([slug, examples]) => [
			slug,
			examples.map((example) => {
				const path =
					example.path ?? `entities/documentation/ui/examples/${slug}.tsx`;
				const { code, statements } = readModule(resolve(appRoot, path));
				const declaration = statements.find(
					(node) =>
						node.type === "ExportNamedDeclaration" &&
						node.declaration?.id?.name === example.name
				);
				if (!declaration) {
					throw new Error(`Missing usage example ${example.name}`);
				}
				return {
					...example,
					code: renderUsageSource(
						declaration,
						statements,
						code,
						resolve(appRoot, path)
					),
					path,
				};
			}),
		])
	);
}

function declarationNames(statement) {
	const node = statement.declaration ?? statement;
	const names = new Set();
	if (node.id) {
		collectNames(node.id, names);
	}
	for (const item of node.declarations ?? []) {
		collectNames({ ...item.id, typeAnnotation: undefined }, names);
	}
	return names;
}

function usageDeclarations(declarations, statements) {
	const needed = new Set();
	for (const declaration of declarations) {
		collectNames(declaration, needed);
	}
	const selected = new Set(declarations);
	let previousSize;
	do {
		previousSize = selected.size;
		for (const statement of statements) {
			if (
				statement.type !== "ImportDeclaration" &&
				[...declarationNames(statement)].some((name) => needed.has(name))
			) {
				selected.add(statement);
				collectNames(statement, needed);
			}
		}
	} while (selected.size !== previousSize);
	return { needed, selected: statements.filter((node) => selected.has(node)) };
}

function renderUsageSource(declaration, statements, code, owner) {
	const bundle = {
		entry: declaration,
		imports: new Map(),
		sources: [],
		visited: new Set(),
	};
	collectUsageModule([declaration], statements, code, owner, bundle);
	const directive = statements
		.filter((node) => node.directive)
		.map((node) => code.slice(...node.range));
	return [
		...directive,
		...[...bundle.imports.values()].map(renderUsageImport),
		...bundle.sources,
		code.slice(...declaration.range),
		"",
	].join("\n\n");
}

function collectUsageModule(declarations, statements, code, owner, bundle) {
	const { needed, selected } = usageDeclarations(declarations, statements);
	for (const node of statements.filter(
		(item) => item.type === "ImportDeclaration"
	)) {
		const specifiers = node.specifiers.filter((item) =>
			needed.has(item.local.name)
		);
		if (!specifiers.length) {
			continue;
		}
		if (node.source.value.startsWith(".")) {
			collectUsageDependency(node, specifiers, owner, bundle);
		} else {
			addUsageImport(node, specifiers, code, bundle.imports);
		}
	}
	for (const node of selected) {
		const key = `${owner}:${node.range[0]}`;
		if (bundle.visited.has(key)) {
			continue;
		}
		bundle.visited.add(key);
		// The caller renders the public entry after its dependencies.
		if (node === bundle.entry) {
			continue;
		}
		const source = code.slice(...node.range).replace(EXPORT_PREFIX, "");
		// Sibling modules may each declare the same local helper.
		if (!bundle.sources.includes(source)) {
			bundle.sources.push(source);
		}
	}
}

function collectUsageDependency(node, specifiers, owner, bundle) {
	const path = resolveModule(owner, node.source.value);
	const module = readModule(path);
	const names = new Set(specifiers.map((item) => item.imported.name));
	const declarations = module.statements.filter((item) =>
		[...declarationNames(item)].some((name) => names.has(name))
	);
	collectUsageModule(
		declarations,
		module.statements,
		module.code,
		path,
		bundle
	);
	for (const item of module.statements) {
		if (
			item.type !== "ExportNamedDeclaration" ||
			!item.source?.value.startsWith(".")
		) {
			continue;
		}
		const reexported = item.specifiers.filter((specifier) =>
			names.has(specifier.exported.name)
		);
		if (reexported.length) {
			collectUsageDependency(
				item,
				reexported.map((specifier) => ({
					imported: specifier.local,
					importKind: specifier.exportKind,
					local: specifier.exported,
				})),
				path,
				bundle
			);
		}
	}
	for (const item of specifiers.filter(
		(specifier) => specifier.local.name !== specifier.imported.name
	)) {
		const keyword =
			item.importKind === "type" || node.importKind === "type"
				? "type"
				: "const";
		bundle.sources.push(
			`${keyword} ${item.local.name} = ${item.imported.name};`
		);
	}
}

function addUsageImport(node, specifiers, code, imports) {
	const key = `${node.importKind}:${node.source.value}`;
	const entry = imports.get(key) ?? {
		kind: node.importKind,
		source: node.source.value,
		specifiers: new Map(),
	};
	for (const item of specifiers) {
		entry.specifiers.set(item.local.name, {
			code: code.slice(...item.range),
			type: item.type,
		});
	}
	imports.set(key, entry);
}

function renderUsageImport({ kind, source, specifiers }) {
	const parts = [...specifiers.values()];
	const named = parts
		.filter((item) => item.type === "ImportSpecifier")
		.map((item) => item.code);
	const other = parts
		.filter((item) => item.type !== "ImportSpecifier")
		.map((item) => item.code);
	const imports = [
		...other,
		...(named.length ? [`{ ${named.join(", ")} }`] : []),
	];
	return `import ${kind === "type" ? "type " : ""}${imports.join(", ")} from ${JSON.stringify(source)};`;
}

function collectNames(node, names) {
	if (!node || typeof node !== "object") {
		return;
	}
	if (node.type === "Identifier" || node.type === "JSXIdentifier") {
		names.add(node.name);
	}
	for (const child of Object.values(node)) {
		collectNames(child, names);
	}
}

// Usage snippets are reassembled from parts of example files, so their
// imports land on one line. Format them through Biome's stdin at the repo's
// 80-column width. Formatting reads syntax only, so one run takes every
// snippet, split by marker comments that Biome leaves on their own lines.
const biomeBin = createRequire(import.meta.url).resolve(
	"@biomejs/biome/bin/biome"
);
const SNIPPET_MARKER = "// @@mizen-usage-snippet@@";
// Mid-batch, a directive reads as a plain expression, so lift it off first.
const USE_CLIENT = /^(?<quote>["'])use client\1;\s*/u;

function formatUsageSources(usage) {
	const snippets = Object.values(usage).flat();
	const clientSnippets = new Set(
		snippets.filter((snippet) => USE_CLIENT.test(snippet.code))
	);
	const formatted = execFileSync(
		process.execPath,
		[
			biomeBin,
			"format",
			"--line-width=80",
			"--indent-style=tab",
			"--stdin-file-path=snippets.tsx",
		],
		{
			encoding: "utf8",
			input: snippets
				.map(
					(snippet) =>
						`${SNIPPET_MARKER}\n${snippet.code.replace(USE_CLIENT, "")}`
				)
				.join("\n"),
			killSignal: "SIGKILL",
			maxBuffer: 64 * 1024 * 1024,
			timeout: 20_000,
		}
	)
		.split(`${SNIPPET_MARKER}\n`)
		.slice(1);
	if (formatted.length !== snippets.length) {
		throw new Error("Biome changed the usage snippet count.");
	}
	for (const [index, snippet] of snippets.entries()) {
		const directive = clientSnippets.has(snippet) ? '"use client";\n\n' : "";
		snippet.code = `${directive}${formatted[index].trimEnd()}\n`;
	}
}

const sources = collectExampleSources();
formatUsageSources(sources.usage);
if (process.argv.includes("--check")) {
	if (
		JSON.stringify(JSON.parse(readFileSync(outputPath, "utf8"))) !==
		JSON.stringify(sources)
	) {
		throw new Error(
			"Example sources changed. Run pnpm --filter @mizen-labs/docs docs:sync."
		);
	}
} else {
	writeFileSync(outputPath, `${JSON.stringify(sources, null, 2)}\n`);
}
