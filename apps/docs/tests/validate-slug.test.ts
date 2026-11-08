import { expect, it } from "vite-plus/test";
import { validateSlug } from "../src/entities/documentation/lib/validate-slug";

it.each(["button", "date-time-input", "unknown-component", "chart2"])(
	"accepts a well-formed slug: %s",
	(slug) => {
		expect(validateSlug(slug)).toBe(slug);
	}
);

it.each([
	null,
	undefined,
	{},
	[],
	12,
	true,
	"",
	"Button",
	"../button",
	"a/b",
	"a?b",
	"a#b",
	"a b",
	"a--b",
	"-a",
	"a-",
	"a\n",
])("rejects malformed input: %j", (value) => {
	expect(() => validateSlug(value)).toThrow(
		"Expected a lowercase documentation slug."
	);
});
