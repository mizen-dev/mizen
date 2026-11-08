// @vitest-environment happy-dom

import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Carousel,
	CarouselContent,
	type CarouselContentProps,
	type CarouselControlProps,
	CarouselItem,
	type CarouselItemProps,
	CarouselNext,
	CarouselPrevious,
	type CarouselProps,
} from "../../../packages/ui/src/components/carousel/carousel";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type ContractChecks = [
	RejectsAll<CarouselProps, "className" | "data-slot" | "role" | "style">,
	Accepts<CarouselProps, "aria-label" | "aria-labelledby" | "ref">,
	RejectsAll<
		CarouselContentProps,
		| "aria-label"
		| "aria-labelledby"
		| "className"
		| "data-slot"
		| "role"
		| "style"
		| "tabIndex"
	>,
	Accepts<CarouselContentProps, "ref">,
	RejectsAll<
		CarouselItemProps,
		"className" | "data-slot" | "role" | "style" | "tabIndex"
	>,
	Accepts<CarouselItemProps, "ref">,
	RejectsAll<
		CarouselControlProps,
		"className" | "data-slot" | "disabled" | "role" | "style" | "type"
	>,
	Accepts<CarouselControlProps, "ref">,
];
const contractChecks: ContractChecks = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

const UnsafeCarousel = Carousel as unknown as ComponentType<
	Record<string, unknown>
>;
const UnsafeCarouselContent = CarouselContent as unknown as ComponentType<
	Record<string, unknown>
>;
const UnsafeCarouselItem = CarouselItem as unknown as ComponentType<
	Record<string, unknown>
>;
const UnsafeCarouselNext = CarouselNext as unknown as ComponentType<
	Record<string, unknown>
>;

describe("Carousel contract", () => {
	it("renders a named carousel region with labeled slide groups and controls", () => {
		const markup = renderToStaticMarkup(
			<Carousel aria-label="Project studies">
				<CarouselContent>
					<CarouselItem aria-label="Project Alpha">Alpha</CarouselItem>
					<CarouselItem aria-label="Project Beta">Beta</CarouselItem>
					<CarouselItem aria-label="Project Gamma">Gamma</CarouselItem>
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		);

		expect(markup).toContain('aria-label="Project studies"');
		expect(markup).toContain('aria-roledescription="carousel"');
		expect(markup).toContain('aria-roledescription="slide"');
		expect(markup).toContain('data-slot="carousel-viewport"');
		expect(markup).toContain('data-slot="carousel-next"');
		expect(markup).toContain('aria-label="Previous slide"');
		expect(markup).toContain('aria-label="Next slide"');
		expect(markup).toContain("Project Gamma");
		expect(contractChecks.every(Boolean)).toBe(true);
	});

	it("rejects an empty accessible name", () => {
		const emptyName = "";
		expect(() =>
			renderToStaticMarkup(
				<Carousel aria-label={emptyName}>
					<CarouselContent>
						<CarouselItem>Alpha</CarouselItem>
					</CarouselContent>
				</Carousel>
			)
		).toThrow(TypeError);
	});

	it("protects native roles and slots from untyped overrides", () => {
		const markup = renderToStaticMarkup(
			<UnsafeCarousel
				aria-label="Project studies"
				aria-roledescription="tab"
				className="unsafe"
				data-slot="wrong-root"
				role="button"
				style={{ color: "red" }}
			>
				<UnsafeCarouselContent
					aria-label="wrong viewport"
					aria-labelledby="wrong viewport title"
					className="unsafe"
					data-slot="wrong-viewport"
					role="list"
					style={{ color: "red" }}
					tabIndex={-1}
				>
					<UnsafeCarouselItem
						aria-roledescription="tab"
						className="unsafe"
						data-slot="wrong-item"
						role="button"
						style={{ color: "red" }}
						tabIndex={0}
					>
						Alpha
					</UnsafeCarouselItem>
				</UnsafeCarouselContent>
				<UnsafeCarouselNext
					className="unsafe"
					data-slot="wrong-control"
					disabled={false}
					onClick={vi.fn()}
					role="link"
					style={{ color: "red" }}
					type="submit"
				/>
			</UnsafeCarousel>
		);

		expect(markup).toContain('aria-roledescription="carousel"');
		expect(markup).toContain('data-slot="carousel"');
		expect(markup).toContain('data-slot="carousel-viewport"');
		expect(markup).toContain('data-slot="carousel-item"');
		expect(markup).toContain('data-slot="carousel-next"');
		expect(markup).toContain('type="button"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("wrong-");
		expect(markup).not.toContain('role="button"');
		expect(markup).not.toContain('role="link"');
		expect(markup).not.toContain('type="submit"');
		expect(markup).not.toContain('style="color:red"');
	});
});
