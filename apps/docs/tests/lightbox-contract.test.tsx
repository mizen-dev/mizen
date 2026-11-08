// @vitest-environment happy-dom

import {
	type ComponentProps,
	type HTMLAttributes,
	createElement as h,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	LightboxImage,
	type LightboxImageProps,
	type LightboxPopupProps,
	type LightboxProps,
} from "../../../packages/ui/src/components/lightbox/lightbox";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type ClosedContract = [
	RejectsAll<LightboxProps, "className" | "data-slot" | "role" | "style">,
	RejectsAll<
		LightboxPopupProps,
		"className" | "data-slot" | "style" | "size" | "showCloseButton"
	>,
	RejectsAll<LightboxImageProps, "className" | "data-slot" | "role" | "style">,
	Accepts<LightboxImageProps, "src" | "alt">,
];
const contractChecks: ClosedContract = [true, true, true, true];

describe("Lightbox contract", () => {
	it("requires image source and alternative text in its public props", () => {
		const imageProps: LightboxImageProps = {
			alt: "A lavender field",
			src: "/field.svg",
		};
		expect(imageProps).toEqual({ alt: "A lavender field", src: "/field.svg" });
		expect(contractChecks.every(Boolean)).toBe(true);
	});

	it("keeps native image semantics and guards host styling at runtime", () => {
		const markup = renderToStaticMarkup(
			h(LightboxImage, {
				alt: "A lavender field",
				className: "unsafe",
				"data-slot": "unsafe",
				role: "presentation",
				src: "/field.svg",
				style: { objectFit: "cover" },
			} as ComponentProps<typeof LightboxImage> &
				HTMLAttributes<HTMLImageElement>)
		);
		expect(markup).toContain('<img alt="A lavender field"');
		expect(markup).toContain('data-slot="lightbox-image"');
		expect(markup).toContain('src="/field.svg"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain('role="presentation"');
		expect(markup).not.toContain("style=");
	});
});
