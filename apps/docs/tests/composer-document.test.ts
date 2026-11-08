import { describe, expect, it } from "vite-plus/test";
import { parseComposerClipboard } from "../../../packages/ui/src/components/composer/composer-clipboard";
import {
	type ActiveQuery,
	type ComposerTrigger,
	getComposerText,
	getFilteredItems,
} from "../../../packages/ui/src/components/composer/composer-document";
import { getComposerQuery } from "../../../packages/ui/src/components/composer/composer-query";

describe("Composer draft boundaries", () => {
	it("preserves token identity and metadata while extracting canonical text", () => {
		const draft = parseComposerClipboard(
			JSON.stringify([
				{ text: "Hello ", type: "text" },
				{
					data: "workspace-1",
					extra: "discard",
					id: "team",
					kind: "team",
					label: "Design",
					text: "@design-team",
					trigger: "@",
					type: "mention",
				},
			])
		);
		expect(draft).toEqual([
			{ text: "Hello ", type: "text" },
			{
				data: "workspace-1",
				id: "team",
				kind: "team",
				label: "Design",
				text: "@design-team",
				trigger: "@",
				type: "mention",
			},
		]);
		expect(getComposerText(draft ?? [])).toBe("Hello @design-team");
	});
	it("rejects malformed and oversized structured clipboard documents", () => {
		expect(parseComposerClipboard("not JSON")).toBeNull();
		expect(parseComposerClipboard("{}")).toBeNull();
		expect(
			parseComposerClipboard(
				JSON.stringify([
					{ id: 2, label: "Wrong", trigger: "@", type: "mention" },
				])
			)
		).toBeNull();
		expect(
			parseComposerClipboard(
				JSON.stringify(
					Array.from({ length: 1001 }, () => ({ text: "x", type: "text" }))
				)
			)
		).toBeNull();
		expect(parseComposerClipboard(" ".repeat(100_001))).toBeNull();
	});
	it("cannot select async results belonging to another caret query", () => {
		const trigger: ComposerTrigger = {
			character: "@",
			filter: null,
			items: [{ id: "maya", label: "Maya" }],
			itemsFor: "ma",
			queryKey: "caret-1",
		};
		const query = { character: "@", key: "caret-2", text: "ma" } as ActiveQuery;
		const contains = (text: string, search: string) => text.includes(search);
		expect(getFilteredItems(trigger, query, contains)).toEqual([]);
		expect(
			getFilteredItems({ ...trigger, queryKey: "caret-2" }, query, contains)
		).toEqual(trigger.items);
		expect(
			getFilteredItems(
				{ ...trigger, itemsFor: "another", queryKey: "caret-2" },
				query,
				contains
			)
		).toEqual([]);
	});
	it("handles Unicode queries and ignores email-like interior triggers", () => {
		expect(getComposerQuery("Hello @Álex", 11, ["@"])?.text).toBe("Álex");
		expect(getComposerQuery("sam@example.com", 6, ["@"])).toBeNull();
		expect(getComposerQuery("/rewrite", 8, ["/"])?.character).toBe("/");
	});
});

describe("Composer query contract", () => {
	it.each([
		["@", 1, "", 1],
		["Hello @Maya Chen", 9, "Maya", 11],
		["@Maya\u00a0Chen", 10, "Maya Chen", 10],
		["@𐐀lex", 6, "𐐀lex", 6],
	] as const)("reads %s at UTF-16 offset %i", (text, caret, query, end) => {
		expect(getComposerQuery(text, caret, ["@"])?.text).toBe(query);
		expect(getComposerQuery(text, caret, ["@"])?.end).toBe(end);
	});
	it.each(["@ name", "@a\nb", "@a!b", "mail@ma", "@😀"])(
		"rejects invalid query %s",
		(text) => {
			expect(getComposerQuery(text, text.length, ["@"])).toBeNull();
		}
	);
	it("matches multi-character triggers and stops before following prose", () => {
		expect(getComposerQuery("Say ::al more", 7, ["::"])).toEqual({
			character: "::",
			end: 8,
			start: 4,
			text: "al",
		});
	});
});
