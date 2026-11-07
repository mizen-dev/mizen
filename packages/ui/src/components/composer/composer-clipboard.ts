import type {
	ComposerPart,
	ComposerTokenPart,
	ComposerValue,
} from "./composer-value";
export const COMPOSER_CLIPBOARD_TYPE = "application/x-mizen-composer";
const REQUIRED = ["id", "label", "trigger"] as const;
const OPTIONAL = ["kind", "data", "text"] as const;

function decodePart(input: unknown): ComposerPart {
	if (input === null || typeof input !== "object") {
		throw new Error("Invalid part");
	}
	const record = input as Record<string, unknown>;
	if (record.type === "text" && typeof record.text === "string") {
		return { text: record.text, type: "text" };
	}
	if (!["mention", "action"].includes(String(record.type))) {
		throw new Error("Invalid token");
	}
	const token = { type: record.type } as ComposerTokenPart;
	for (const field of REQUIRED) {
		if (typeof record[field] !== "string") {
			throw new Error("Missing token field");
		}
		token[field] = record[field];
	}
	for (const field of OPTIONAL) {
		if (typeof record[field] === "string") {
			token[field] = record[field];
		}
	}
	return token;
}

export function parseComposerClipboard(raw: string): ComposerValue | null {
	if (raw.length > 100_000) {
		return null;
	}
	try {
		const decoded: unknown = JSON.parse(raw);
		if (!Array.isArray(decoded) || decoded.length > 1000) {
			return null;
		}
		return decoded.map(decodePart);
	} catch {
		return null;
	}
}
