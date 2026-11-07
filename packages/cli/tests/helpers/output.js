import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Ajv from "ajv";

export const schema = JSON.parse(
	readFileSync(new URL("../../schema/v1.json", import.meta.url), "utf8")
);
export const validateOutput = new Ajv({
	allErrors: true,
	strict: true,
}).compile(schema);
export function parseOutput(text) {
	const value = JSON.parse(text);
	assert.ok(
		validateOutput(value),
		JSON.stringify(validateOutput.errors, null, 2)
	);
	return value;
}
