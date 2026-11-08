import type { SkeletonProps, SkeletonShape } from "@mizen-labs/ui/skeleton";
import type { RefObject } from "react";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { Skeleton } from "../../../packages/ui/src/components/skeleton/skeleton";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: (frames: unknown) => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

const contractChecks = [
	false satisfies Accepts<SkeletonProps, "className">,
	false satisfies Accepts<SkeletonProps, "style">,
	false satisfies Accepts<SkeletonProps, "data-slot">,
	true satisfies Accepts<SkeletonProps, "children">,
	true satisfies Accepts<SkeletonProps, "shape">,
	true satisfies Accepts<SkeletonProps, "ref">,
	true satisfies Accepts<SkeletonProps, "aria-hidden">,
] as const;

const expectedContractChecks = [
	false,
	false,
	false,
	true,
	true,
	true,
	true,
] as const;

describe("Skeleton component contract and SSR semantics", () => {
	it("resolves root and subpath exports with an exact closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/skeleton")).toContain(
			"packages/ui/dist/components/skeleton/skeleton.js"
		);
		expect(contractChecks).toEqual(expectedContractChecks);
	});

	it("renders default line shape with aria-hidden and protected data-slot", () => {
		const markup = renderToStaticMarkup(createElement(Skeleton));
		expect(markup).toContain('data-slot="skeleton"');
		expect(markup).toContain('data-shape="line"');
		expect(markup).toContain('aria-hidden="true"');
	});

	it("protects data-slot and data-shape from consumer override", () => {
		type MaliciousProps = SkeletonProps & {
			"data-shape"?: string;
			"data-slot"?: string;
		};
		const maliciousProps: MaliciousProps = {
			"data-shape": "custom-shape",
			"data-slot": "custom-slot",
			shape: "circle",
		};
		const markup = renderToStaticMarkup(
			createElement(Skeleton, maliciousProps)
		);
		expect(markup).toContain('data-slot="skeleton"');
		expect(markup).toContain('data-shape="circle"');
		expect(markup).not.toContain("custom-slot");
		expect(markup).not.toContain("custom-shape");
	});

	it("allows consumer aria-hidden override", () => {
		const markup = renderToStaticMarkup(
			createElement(Skeleton, { "aria-hidden": false })
		);
		expect(markup).toContain('aria-hidden="false"');
	});

	it("renders all three SSR shapes with children and forwards refs", () => {
		const ref: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();
		const shapes: readonly SkeletonShape[] = ["line", "circle", "rectangle"];

		for (const shape of shapes) {
			const markup = renderToStaticMarkup(
				createElement(
					Skeleton,
					{ ref, shape },
					createElement("span", null, `${shape}-content`)
				)
			);
			expect(markup).toContain(`data-shape="${shape}"`);
			expect(markup).toContain('data-slot="skeleton"');
			expect(markup).toContain('aria-hidden="true"');
			expect(markup).toContain(`${shape}-content`);
		}
	});
});
