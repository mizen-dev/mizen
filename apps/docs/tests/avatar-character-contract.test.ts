import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	AvatarCharacter,
	type AvatarCharacterProps,
} from "../../../packages/ui/src/components/avatar/avatar";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = K extends keyof T ? false : true;
const closed = [
	true satisfies Rejects<AvatarCharacterProps, "className">,
	true satisfies Rejects<AvatarCharacterProps, "style">,
	true satisfies Rejects<AvatarCharacterProps, "children">,
] as const;

const geometryPattern = /<svg[^>]*>([\s\S]*)<\/svg>/;
const geometry = (seed: string, size?: AvatarCharacterProps["size"]) =>
	renderToStaticMarkup(h(AvatarCharacter, { seed, size })).match(
		geometryPattern
	)?.[1];

describe("AvatarCharacter", () => {
	it("preserves the v1 identity fixture", () => {
		expect(geometry("member:maya")).toBe(
			'<path d="M7 52V31a17 17 0 0 1 34 0v21ZM24 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"></path><g><ellipse cx="16" cy="31" rx="2.5" ry="3.6"></ellipse><ellipse cx="29" cy="31" rx="2.5" ry="3.6"></ellipse></g>'
		);
	});
	it("keeps the same identity across renders and sizes", () => {
		for (const seed of ["member:maya", "", "Мария", "🦊", "user:42"]) {
			const face = geometry(seed);
			expect(face).toBeTruthy();
			expect(geometry(seed)).toBe(face);
			expect(geometry(seed, "sm")).toBe(face);
			expect(geometry(seed, "lg")).toBe(face);
		}
	});
	it("varies designs and handles long seeds", () => {
		const faces = new Set(
			Array.from({ length: 100 }, (_, i) => geometry(`member:${i}`))
		);
		expect(faces.size).toBeGreaterThan(50);
		expect(geometry("id".repeat(10_000))).not.toContain("NaN");
	});
	it("provides an image name only when requested", () => {
		const named = renderToStaticMarkup(
			h(AvatarCharacter, { label: "Maya Chen", seed: "42" })
		);
		expect(named).toContain('role="img"');
		expect(named).toContain('aria-label="Maya Chen"');
		expect(named).not.toContain('aria-hidden="true"');
		expect(renderToStaticMarkup(h(AvatarCharacter, { seed: "42" }))).toContain(
			'aria-hidden="true"'
		);
		expect(closed.every(Boolean)).toBe(true);
	});
});
