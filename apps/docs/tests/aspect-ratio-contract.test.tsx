// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	AspectRatio,
	type AspectRatioProps,
} from "../../../packages/ui/src/components/aspect-ratio/aspect-ratio";

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

type Rejects<T, K extends PropertyKey> = K extends keyof T ? false : true;
type HasRef<T> = "ref" extends keyof T ? true : false;
type IsRequired<T, K extends keyof T> =
	Record<string, never> extends Pick<T, K> ? false : true;
type ClosedAspectRatioContract = [
	Rejects<AspectRatioProps, "className">,
	Rejects<AspectRatioProps, "style">,
	Rejects<AspectRatioProps, "data-slot">,
	Rejects<AspectRatioProps, "role">,
	HasRef<AspectRatioProps>,
	IsRequired<AspectRatioProps, "children">,
];
const aspectRatioContract: ClosedAspectRatioContract = [
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("AspectRatio contract", () => {
	it("uses a native ratio style and fills its grid cell", () => {
		const markup = renderToStaticMarkup(
			<AspectRatio aria-label="Preview" ratio={4 / 3}>
				<span>Preview</span>
			</AspectRatio>
		);

		expect(markup).toContain('data-slot="aspect-ratio"');
		expect(markup).toContain('data-slot="aspect-ratio-content"');
		expect(markup).toContain('aria-label="Preview"');
		expect(markup).toContain("<span>Preview</span>");
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({ aspectRatio: 4 / 3, position: "relative" }),
			expect.anything()
		);
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				insetBlockEnd: 0,
				insetBlockStart: 0,
				insetInlineEnd: 0,
				insetInlineStart: 0,
				position: "absolute",
			})
		);
		expect(aspectRatioContract.every(Boolean)).toBe(true);
	});

	it("defaults to 16:9, strips reserved attributes, and rejects invalid ratios", () => {
		const markup = renderToStaticMarkup(
			Reflect.apply(AspectRatio, undefined, [
				{
					children: "Preview",
					className: "unsafe",
					"data-slot": "unsafe",
					role: "button",
					style: { color: "red" },
				},
			])
		);

		expect(markup).toContain('data-slot="aspect-ratio"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("style=");
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({ aspectRatio: 16 / 9, position: "relative" }),
			expect.anything()
		);
		expect(() =>
			renderToStaticMarkup(<AspectRatio ratio={Number.NaN}>x</AspectRatio>)
		).toThrow(RangeError);
	});
});
