// Derives each component's import line and part anatomy from its first usage
// example, so both always match code that compiles and renders.

const WORD_BREAK = /[^A-Za-z0-9]+/u;

const pascalCase = (name) =>
	name
		.split(WORD_BREAK)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join("");

const elementName = (node) =>
	node.openingElement.name.type === "JSXIdentifier"
		? node.openingElement.name.name
		: null;

function childElements(node) {
	return (node.children ?? []).flatMap((child) => findElements(child));
}

// Elements reachable below a node, skipping through expressions and maps.
function findElements(node) {
	if (!node || typeof node !== "object") {
		return [];
	}
	if (node.type === "JSXElement") {
		return [node];
	}
	return Object.entries(node)
		.filter(([key]) => key !== "loc" && key !== "range" && key !== "parent")
		.flatMap(([, value]) =>
			Array.isArray(value)
				? value.flatMap((item) => findElements(item))
				: findElements(value)
		);
}

// Function components declared in the example file, by name.
function localComponents(program) {
	const entries = program.body.flatMap((statement) => {
		const node = statement.declaration ?? statement;
		if (node.type === "FunctionDeclaration") {
			return [[node.id.name, node.body]];
		}
		return (node.declarations ?? []).map((item) => [item.id.name, item.init]);
	});
	return new Map(entries);
}

// Keep only this component's parts, in their real nesting; a local helper
// component is read through. Identical neighbors collapse to one.
function partTree(element, scope, depth = 0) {
	const name = elementName(element);
	const local = scope.locals.get(name);
	if (local && !scope.parts.has(name) && depth < 4) {
		return findElements(local).flatMap((inner) =>
			partTree(inner, scope, depth + 1)
		);
	}
	const children = childElements(element).flatMap((child) =>
		partTree(child, scope, depth)
	);
	if (!scope.parts.has(name)) {
		return children;
	}
	const unique = children.filter(
		(child, index) =>
			index === 0 ||
			JSON.stringify(child) !== JSON.stringify(children[index - 1])
	);
	return [{ children: unique, name }];
}

function render(nodes, depth = 0) {
	const indent = "\t".repeat(depth);
	return nodes
		.map(({ children, name }) =>
			children.length === 0
				? `${indent}<${name} />`
				: `${indent}<${name}>\n${render(children, depth + 1)}\n${indent}</${name}>`
		)
		.join("\n");
}

function usedNames(nodes, names = []) {
	for (const { children, name } of nodes) {
		if (!names.includes(name)) {
			names.push(name);
		}
		usedNames(children, names);
	}
	return names;
}

export function collectAnatomy({ docs, exports, parse, usage }) {
	return Object.fromEntries(
		docs.map((doc) => {
			const root = pascalCase(doc.name);
			const parts = new Set(
				[
					...[...exports].filter((name) => name.startsWith(root)),
					...doc.api.map(({ name }) => name),
				].filter((name) => exports.has(name))
			);
			const example = usage[doc.slug]?.[0];
			const program = example ? parse(example.code) : null;
			const locals = program ? localComponents(program) : new Map();
			const entry = locals.get(example?.name);
			const tree = entry
				? findElements(entry).flatMap((element) =>
						partTree(element, { locals, parts })
					)
				: [];
			const names = usedNames(tree);
			return [
				doc.slug,
				{
					anatomy: names.length > 1 ? render(tree) : null,
					imports: names.length > 0 ? names : [...parts].slice(0, 1),
				},
			];
		})
	);
}
