// @vitest-environment happy-dom

import type { ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Thumbnail,
	type ThumbnailProps,
	type ThumbnailSize,
} from "../../../packages/ui/src/components/thumbnail/thumbnail";

const propsSpy = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: propsSpy,
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type Required<T, K extends PropertyKey> = K extends keyof T
	? Record<string, never> extends Pick<T, K>
		? false
		: true
	: false;
type HasRef<T> = "ref" extends keyof T ? true : false;
type Closed<T> = [
	Rejects<
		T,
		| "children"
		| "className"
		| "data-slot"
		| "height"
		| "role"
		| "style"
		| "width"
	>,
	Required<T, "alt"> extends true ? Required<T, "src"> : false,
	HasRef<T>,
];
type NativePropsRemain = [
	"id" extends keyof ThumbnailProps ? true : false,
	"loading" extends keyof ThumbnailProps ? true : false,
	"sizes" extends keyof ThumbnailProps ? true : false,
	"srcSet" extends keyof ThumbnailProps ? true : false,
];
type SizeValues = ThumbnailSize extends "sm" | "default" | "lg" ? true : false;
const contract: Closed<ThumbnailProps> = [true, true, true];
const nativeProps: NativePropsRemain = [true, true, true, true];
const sizeValues: SizeValues = true;
const UnsafeThumbnail = Thumbnail as ComponentType<Record<string, unknown>>;

describe("Thumbnail contract", () => {
	it("uses a native image with required alternative text and bounded square sizes", () => {
		const markup = renderToStaticMarkup(
			<Thumbnail alt="Project map" size="lg" src="/media/project-map.svg" />
		);

		expect(markup).toContain('<img alt="Project map"');
		expect(markup).toContain('data-slot="thumbnail"');
		expect(markup).toContain('height="64"');
		expect(markup).toContain('src="/media/project-map.svg"');
		expect(markup).toContain('width="64"');
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				aspectRatio: 1,
				objectFit: "cover",
			}),
			expect.objectContaining({ height: "4rem", width: "4rem" })
		);
		expect(contract.every(Boolean)).toBe(true);
		expect(nativeProps.every(Boolean)).toBe(true);
		expect(sizeValues).toBe(true);
	});

	it("allows decorative empty alt text and protects component-owned sizing and slots", () => {
		const markup = renderToStaticMarkup(
			h(UnsafeThumbnail, {
				alt: "",
				className: "unsafe",
				"data-slot": "unsafe",
				height: 999,
				role: "button",
				size: "sm",
				src: "/media/decorative.svg",
				style: { color: "red" },
				width: 999,
			})
		);

		expect(markup).toContain('alt=""');
		expect(markup).toContain('data-slot="thumbnail"');
		expect(markup).toContain('height="32"');
		expect(markup).toContain('width="32"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("999");
		expect(markup).not.toContain("style=");
	});

	it("rejects a missing image source", () => {
		expect(() =>
			renderToStaticMarkup(<Thumbnail alt="Project map" src="  " />)
		).toThrow(TypeError);
	});
});
