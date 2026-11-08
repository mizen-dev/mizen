// The import line, wrapped the way the formatter would past 80 columns.
export function importStatement(names: readonly string[]) {
	const sorted = names.toSorted();
	const line = `import { ${sorted.join(", ")} } from "@mizen-labs/ui";`;
	return line.length <= 80
		? line
		: `import {\n${sorted.map((name) => `\t${name},`).join("\n")}\n} from "@mizen-labs/ui";`;
}
