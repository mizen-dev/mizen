const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function validateSlug(value: unknown): string {
	if (typeof value !== "string" || !SLUG.test(value)) {
		throw new Error("Expected a lowercase documentation slug.");
	}
	return value;
}
