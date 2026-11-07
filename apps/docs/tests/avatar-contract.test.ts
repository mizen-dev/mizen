// @vitest-environment happy-dom

import type { ReactElement, ReactNode } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Avatar,
	AvatarFallback,
	type AvatarFallbackProps,
	AvatarImage,
	type AvatarImageProps,
	type AvatarProps,
	type AvatarSize,
} from "../../../packages/ui/src/components/avatar/avatar";
import { avatarStyles } from "../../../packages/ui/src/components/avatar/avatar.styles";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const avatarSpanPattern = /^<span[^>]*data-slot="avatar"/;

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

type Rejects<Props, Key extends PropertyKey> = Key extends keyof Props
	? false
	: true;

type IsRequired<T, K extends keyof T> =
	Record<string, never> extends Pick<T, K> ? false : true;

const contractChecks = [
	true satisfies Exact<AvatarSize, "default" | "lg" | "sm">,

	true satisfies Rejects<AvatarProps, "className">,
	true satisfies Rejects<AvatarProps, "style">,
	true satisfies Rejects<AvatarProps, "data-slot">,
	true satisfies Rejects<AvatarProps, "shape">,
	true satisfies Accepts<AvatarProps, "size">,
	true satisfies Accepts<AvatarProps, "children">,
	true satisfies Accepts<AvatarProps, "render">,
	true satisfies Accepts<AvatarProps, "ref">,

	true satisfies Rejects<AvatarImageProps, "className">,
	true satisfies Rejects<AvatarImageProps, "style">,
	true satisfies Rejects<AvatarImageProps, "data-slot">,
	true satisfies Rejects<AvatarImageProps, "size">,
	true satisfies Rejects<AvatarImageProps, "shape">,
	true satisfies Accepts<AvatarImageProps, "ref">,
	true satisfies Accepts<AvatarImageProps, "render">,
	true satisfies Accepts<AvatarImageProps, "keepMounted">,
	true satisfies Accepts<AvatarImageProps, "onLoadingStatusChange">,
	true satisfies Exact<AvatarImageProps["alt"], string>,
	true satisfies Exact<IsRequired<AvatarImageProps, "alt">, true>,

	true satisfies Rejects<AvatarFallbackProps, "className">,
	true satisfies Rejects<AvatarFallbackProps, "style">,
	true satisfies Rejects<AvatarFallbackProps, "data-slot">,
	true satisfies Rejects<AvatarFallbackProps, "size">,
	true satisfies Rejects<AvatarFallbackProps, "shape">,
	true satisfies Accepts<AvatarFallbackProps, "delay">,
	true satisfies Accepts<AvatarFallbackProps, "children">,
	true satisfies Accepts<AvatarFallbackProps, "render">,
	true satisfies Accepts<AvatarFallbackProps, "ref">,
] as const;

type MaliciousComp = (props: {
	alt?: string;
	children?: ReactNode;
	"data-slot"?: string;
	keepMounted?: boolean;
	render?: ReactElement | ((p: Record<string, unknown>) => ReactElement);
	src?: string;
}) => ReactElement;

describe("Avatar component contract and SSR semantics", () => {
	it("enforces closed prop contracts and required alt", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("renders default Avatar as a span host with avatar data-slot", () => {
		const markup = renderToStaticMarkup(
			h(
				Avatar,
				null,
				h(AvatarImage, {
					alt: "User avatar",
					src: "https://example.com/photo.jpg",
				}),
				h(AvatarFallback, null, "UA")
			)
		);

		expect(markup).toMatch(avatarSpanPattern);
		expect(markup).toContain('data-slot="avatar"');
		expect(markup).toContain('data-slot="avatar-fallback"');
		expect(markup).toContain("UA");
	});

	it("protects data-slot against direct prop overrides across all three components", () => {
		const rootMarkup = renderToStaticMarkup(
			h(Avatar as MaliciousComp, { "data-slot": "malicious-avatar" }, "Text")
		);
		expect(rootMarkup).toContain('data-slot="avatar"');
		expect(rootMarkup).not.toContain("malicious-avatar");

		const imageMarkup = renderToStaticMarkup(
			h(
				Avatar,
				null,
				h(AvatarImage as MaliciousComp, {
					alt: "User",
					"data-slot": "malicious-avatar-image",
					keepMounted: true,
					src: "https://example.com/photo.jpg",
				})
			)
		);
		expect(imageMarkup).toContain('data-slot="avatar-image"');
		expect(imageMarkup).not.toContain("malicious-avatar-image");

		const fallbackMarkup = renderToStaticMarkup(
			h(
				Avatar,
				null,
				h(
					AvatarFallback as MaliciousComp,
					{ "data-slot": "malicious-avatar-fallback" },
					"UA"
				)
			)
		);
		expect(fallbackMarkup).toContain('data-slot="avatar-fallback"');
		expect(fallbackMarkup).not.toContain("malicious-avatar-fallback");
	});

	it("protects data-slot against render element and render callback overrides", () => {
		const fromElement = renderToStaticMarkup(
			h(Avatar as MaliciousComp, {
				render: h("div", { "data-slot": "override-slot" }),
			})
		);
		expect(fromElement).toContain('data-slot="avatar"');
		expect(fromElement).not.toContain("override-slot");

		const fromCallback = renderToStaticMarkup(
			h(Avatar as MaliciousComp, {
				render: (props) => h("div", { ...props, "data-slot": "bad-fn-slot" }),
			})
		);
		expect(fromCallback).toContain('data-slot="avatar"');
		expect(fromCallback).not.toContain("bad-fn-slot");
	});

	it("forwards refs to each host element", async () => {
		const container = document.createElement("div");
		const root = createRoot(container);
		const refs = {
			fallback: createRef<HTMLSpanElement>(),
			image: createRef<HTMLImageElement>(),
			root: createRef<HTMLSpanElement>(),
		};

		await act(() =>
			root.render(
				h(
					Avatar,
					{ ref: refs.root },
					h(AvatarImage, {
						alt: "User",
						keepMounted: true,
						ref: refs.image,
						src: "https://example.com/photo.jpg",
					}),
					h(AvatarFallback, { ref: refs.fallback }, "UA")
				)
			)
		);
		expect(refs.root.current?.dataset.slot).toBe("avatar");
		expect(refs.image.current?.dataset.slot).toBe("avatar-image");
		expect(refs.fallback.current?.dataset.slot).toBe("avatar-fallback");
		await act(() => root.unmount());
	});

	it("supports keepMounted mode on AvatarImage", () => {
		const markup = renderToStaticMarkup(
			h(
				Avatar,
				null,
				h(AvatarImage, {
					alt: "User",
					keepMounted: true,
					src: "https://example.com/photo.jpg",
				}),
				h(AvatarFallback, null, "UA")
			)
		);
		expect(markup).toContain('data-slot="avatar-image"');
		expect(markup).toContain('alt="User"');
		expect(markup).toContain('aria-hidden="true"');
	});

	it("renders fallback with delay without throwing in SSR", () => {
		const delayedMarkup = renderToStaticMarkup(
			h(Avatar, null, h(AvatarFallback, { delay: 300 }, "AB"))
		);
		expect(delayedMarkup).toContain('data-slot="avatar"');
		expect(delayedMarkup).not.toContain("AB");

		const immediateMarkup = renderToStaticMarkup(
			h(Avatar, null, h(AvatarFallback, null, "AB"))
		);
		expect(immediateMarkup).toContain('data-slot="avatar-fallback"');
		expect(immediateMarkup).toContain("AB");
	});

	it("renders finite size variants without runtime failure", () => {
		const sizes: readonly AvatarSize[] = ["sm", "default", "lg"] as const;
		for (const size of sizes) {
			const markup = renderToStaticMarkup(
				h(Avatar, { size }, h(AvatarFallback, null, size))
			);
			expect(markup).toContain('data-slot="avatar"');
			expect(markup).toContain(size);
		}
	});

	it("positions fallback as an absolute overlay with logical inset zero", () => {
		expect(avatarStyles.fallback).toMatchObject({
			height: "100%",
			insetBlock: 0,
			insetInline: 0,
			position: "absolute",
			width: "100%",
		});
	});
});
