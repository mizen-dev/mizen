// @vitest-environment happy-dom
import type { ComponentProps, ReactElement } from "react";
import { act, createRef, useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { Field } from "../../../packages/ui/src/components/field/field";
import type { SliderProps } from "../../../packages/ui/src/components/slider/slider";
import {
	Slider,
	SliderControl,
	SliderIndicator,
	SliderThumb,
	SliderTrack,
	SliderValue,
} from "../../../packages/ui/src/components/slider/slider";
import { mount } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
function ToggleSlider({
	onSetInvalidFn,
}: {
	onSetInvalidFn: (value: (val: boolean) => void) => void;
}) {
	const [invalid, setInvalid] = useState(true);
	onSetInvalidFn(setInvalid);
	return (
		<Slider aria-label="Toggle slider" defaultValue={40} invalid={invalid} />
	);
}
function ToggleFieldSlider({
	onSetInvalidFn,
}: {
	onSetInvalidFn: (value: (val: boolean) => void) => void;
}) {
	const [invalid, setInvalid] = useState(true);
	onSetInvalidFn(setInvalid);
	return (
		<Field invalid>
			<Slider
				aria-label="Toggle in field slider"
				defaultValue={40}
				invalid={invalid}
			/>
		</Field>
	);
}
function getTestAriaLabel(index: number): string {
	return index === 0 ? "Lower bound" : "Upper bound";
}
describe("Slider behavior, Field integration, and slot protection", () => {
	it("keeps children and thumb values with default anatomy", () => {
		const { container, unmount } = mount(
			<Slider
				aria-label="Zoom"
				defaultValue={1}
				format={{
					style: "percent",
				}}
				max={2}
				min={0}
				step={0.1}
				thumbValue
				ticks
			>
				<SliderValue />
			</Slider>
		);
		const root = container.querySelector<HTMLElement>('[data-slot="slider"]');
		expect(root).not.toBeNull();
		expect(
			container.querySelectorAll('[data-slot="slider-control"]')
		).toHaveLength(1);
		expect(
			container.querySelector('[data-slot="slider-value"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="slider-thumb"]')?.textContent
		).toBe("100%");
		expect(
			container.querySelector('[data-slot="slider-ticks"]')?.children
		).toHaveLength(21);
		unmount();
	});
	it("preserves Base UI Field invalid state on slider root, track, indicator, thumb, and input", () => {
		const { container, unmount } = mount(
			<Field invalid>
				<Slider aria-label="Field bounded slider" defaultValue={50} />
			</Field>
		);
		const root = container.querySelector('[data-slot="slider"]');
		const track = container.querySelector('[data-slot="slider-track"]');
		const indicator = container.querySelector('[data-slot="slider-indicator"]');
		const thumb = container.querySelector('[data-slot="slider-thumb"]');
		const input = container.querySelector<HTMLInputElement>("input");
		expect(root?.hasAttribute("data-invalid")).toBe(true);
		expect(track?.hasAttribute("data-invalid")).toBe(true);
		expect(indicator?.hasAttribute("data-invalid")).toBe(true);
		expect(thumb?.hasAttribute("data-invalid")).toBe(true);
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		unmount();
	});
	it("clears wrapper-owned invalid state on toggle when no Field invalid ancestor exists", () => {
		let setInvalidFn: (val: boolean) => void = () => undefined;
		const onSetInvalidFn: ComponentProps<
			typeof ToggleSlider
		>["onSetInvalidFn"] = (value) => {
			setInvalidFn = value;
		};
		const { container, unmount } = mount(
			<ToggleSlider onSetInvalidFn={onSetInvalidFn} />
		);
		const input = container.querySelector<HTMLInputElement>("input");
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		act(() => {
			setInvalidFn(false);
		});
		expect(input?.hasAttribute("aria-invalid")).toBe(false);
		unmount();
	});
	it("never clears Field-owned invalid state when standalone invalid turns false", () => {
		let setInvalidFn: (val: boolean) => void = () => undefined;
		const onSetInvalidFn: ComponentProps<
			typeof ToggleFieldSlider
		>["onSetInvalidFn"] = (value) => {
			setInvalidFn = value;
		};
		const { container, unmount } = mount(
			<ToggleFieldSlider onSetInvalidFn={onSetInvalidFn} />
		);
		const input = container.querySelector<HTMLInputElement>("input");
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		act(() => {
			setInvalidFn(false);
		});
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		unmount();
	});
	it("supports getAriaLabel localization seam on range thumbs with root label fallback", () => {
		const { container, unmount } = mount(
			<Slider defaultValue={[20, 80]} getAriaLabel={getTestAriaLabel} />
		);
		const inputs = container.querySelectorAll<HTMLInputElement>("input");
		expect(inputs).toHaveLength(2);
		expect(inputs[0]?.getAttribute("aria-label")).toBe("Lower bound");
		expect(inputs[1]?.getAttribute("aria-label")).toBe("Upper bound");
		unmount();
	});
	it("renders default anatomy with null children", () => {
		const { container, unmount } = mount(
			<Slider aria-label="Null children slider" defaultValue={25}>
				{null}
			</Slider>
		);
		expect(
			container.querySelector('[data-slot="slider-track"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="slider-thumb"]')
		).not.toBeNull();
		unmount();
	});
	it("protects data-slot and strips forbidden props in render composition", () => {
		const forbiddenRootProps = {
			className: "forbidden-class",
		};
		const forbiddenTrackProps = {
			className: "forbidden-track",
		};
		const { container, unmount } = mount(
			<Slider
				{...forbiddenRootProps}
				defaultValue={30}
				render={<section data-testid="custom-root" />}
			>
				<SliderControl render={<div data-testid="custom-control" />}>
					<SliderTrack
						{...forbiddenTrackProps}
						render={<div data-testid="custom-track" />}
					>
						<SliderIndicator render={<div data-testid="custom-indicator" />} />
						<SliderThumb
							aria-label="Custom thumb"
							render={<span data-testid="custom-thumb" />}
						/>
					</SliderTrack>
				</SliderControl>
			</Slider>
		);
		const root = container.querySelector('[data-testid="custom-root"]');
		const control = container.querySelector('[data-testid="custom-control"]');
		const track = container.querySelector('[data-testid="custom-track"]');
		const indicator = container.querySelector(
			'[data-testid="custom-indicator"]'
		);
		const thumb = container.querySelector('[data-testid="custom-thumb"]');
		expect(root?.getAttribute("data-slot")).toBe("slider");
		expect(control?.getAttribute("data-slot")).toBe("slider-control");
		expect(track?.getAttribute("data-slot")).toBe("slider-track");
		expect(indicator?.getAttribute("data-slot")).toBe("slider-indicator");
		expect(thumb?.getAttribute("data-slot")).toBe("slider-thumb");
		expect(root?.classList.contains("forbidden-class")).toBe(false);
		expect(track?.classList.contains("forbidden-track")).toBe(false);
		unmount();
	});
	it("preserves object refs, callback refs, and React 19 callback cleanup on inputRef", () => {
		const objRef = createRef<HTMLInputElement>();
		const cleanupFn = vi.fn();
		const callbackRef = vi.fn((el: HTMLInputElement | null) => {
			if (el) {
				return cleanupFn;
			}
		});
		const { container, unmount } = mount(
			<Slider defaultValue={50}>
				<SliderControl>
					<SliderTrack>
						<SliderThumb aria-label="Ref thumb 1" inputRef={objRef} />
						<SliderThumb aria-label="Ref thumb 2" inputRef={callbackRef} />
					</SliderTrack>
				</SliderControl>
			</Slider>
		);
		const inputs = container.querySelectorAll<HTMLInputElement>("input");
		expect(objRef.current).toBe(inputs[0]);
		expect(callbackRef).toHaveBeenCalledWith(inputs[1]);
		unmount();
		expect(objRef.current).toBeNull();
		expect(cleanupFn).toHaveBeenCalled();
	});
	it("preserves Base UI computed data-index on Thumb when index prop is undefined", () => {
		const { container, unmount } = mount(
			<Slider defaultValue={50}>
				<SliderControl>
					<SliderTrack>
						<SliderThumb aria-label="Scalar thumb" />
					</SliderTrack>
				</SliderControl>
			</Slider>
		);
		const thumb = container.querySelector('[data-slot="slider-thumb"]');
		expect(thumb?.getAttribute("data-index")).toBe("0");
		unmount();
	});
	it("renders one input when controlled scalar value takes precedence over array defaultValue", () => {
		// Given a controlled scalar value and an array defaultValue
		const DynamicSlider: (
			props: SliderProps<number | readonly number[]>
		) => ReactElement = Slider;
		const { container, unmount } = mount(
			<DynamicSlider
				aria-label="Controlled scalar slider"
				defaultValue={[20, 80]}
				value={50}
			/>
		);

		// When querying the rendered input elements
		const inputs = container.querySelectorAll<HTMLInputElement>("input");

		// Then only one input is rendered for the scalar slider
		expect(inputs).toHaveLength(1);
		unmount();
	});
	it("names thumbs via root getAriaLabel in custom composition without prop drilling", () => {
		// Given a range slider using custom composition and getAriaLabel on the root
		const { container, unmount } = mount(
			<Slider defaultValue={[20, 80]} getAriaLabel={getTestAriaLabel}>
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb />
						<SliderThumb />
					</SliderTrack>
				</SliderControl>
			</Slider>
		);

		// When querying the rendered thumb inputs
		const inputs = container.querySelectorAll<HTMLInputElement>("input");

		// Then each thumb input receives its localized aria-label without prop drilling
		expect(inputs).toHaveLength(2);
		expect(inputs[0]?.getAttribute("aria-label")).toBe("Lower bound");
		expect(inputs[1]?.getAttribute("aria-label")).toBe("Upper bound");
		unmount();
	});
	it("preserves data-disabled on root and thumb plus native disabled on input when inside disabled Field", () => {
		// Given a Slider inside a disabled Field
		const { container, unmount } = mount(
			<Field disabled>
				<Slider aria-label="Field disabled slider" defaultValue={50} />
			</Field>
		);

		// When querying the root, thumb, and input elements
		const root = container.querySelector('[data-slot="slider"]');
		const thumb = container.querySelector('[data-slot="slider-thumb"]');
		const input = container.querySelector<HTMLInputElement>("input");

		// Then data-disabled is preserved on root and thumb, and input has native disabled
		expect(root?.hasAttribute("data-disabled")).toBe(true);
		expect(thumb?.hasAttribute("data-disabled")).toBe(true);
		expect(input?.disabled).toBe(true);
		unmount();
	});
});
