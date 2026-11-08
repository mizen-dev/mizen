// @vitest-environment happy-dom
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { Field } from "../../../packages/ui/src/components/field/field";
import type { BoundNumberField } from "../../../packages/ui/src/components/field/field-context";
import type { SliderProps } from "../../../packages/ui/src/components/slider/slider";
import {
	Slider,
	SliderControl,
	SliderIndicator,
	SliderThumb,
	SliderTrack,
} from "../../../packages/ui/src/components/slider/slider";
import { mount } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("Slider precedence and callback behavior", () => {
	it("labels default and custom range thumbs without changing index semantics", () => {
		// Given equivalent root getAriaLabel callbacks for default and custom range sliders
		const defaultAnatomySpy = vi.fn((index: number) =>
			index === 0 ? "Lower bound" : "Upper bound"
		);
		const customCompositionSpy = vi.fn((index: number) =>
			index === 0 ? "Lower bound" : "Upper bound"
		);

		// When mounting both two-thumb range configurations
		const defaultSlider = mount(
			<Slider defaultValue={[20, 80]} getAriaLabel={defaultAnatomySpy} />
		);
		const customSlider = mount(
			<Slider defaultValue={[20, 80]} getAriaLabel={customCompositionSpy}>
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb />
						<SliderThumb />
					</SliderTrack>
				</SliderControl>
			</Slider>
		);

		for (const slider of [defaultSlider, customSlider]) {
			const inputs = slider.container.querySelectorAll("input");
			expect(
				Array.from(inputs, (input) => input.getAttribute("aria-label"))
			).toEqual(["Lower bound", "Upper bound"]);
		}

		defaultSlider.unmount();
		customSlider.unmount();
	});

	it("overrides root getAriaLabel context when SliderThumb explicitly provides getAriaLabel={null}", () => {
		// Given a range slider with root getAriaLabel and an explicit null on the first thumb
		const rootGetAriaLabel = (index: number) => `Root thumb ${index}`;
		const { container, unmount } = mount(
			<Slider defaultValue={[20, 80]} getAriaLabel={rootGetAriaLabel}>
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb aria-label="Manual lower" getAriaLabel={null} />
						<SliderThumb />
					</SliderTrack>
				</SliderControl>
			</Slider>
		);

		// When querying rendered thumb inputs
		const inputs = container.querySelectorAll<HTMLInputElement>("input");

		// Then the first thumb uses its explicit aria-label fallback and the second inherits root callback
		expect(inputs).toHaveLength(2);
		expect(inputs[0]?.getAttribute("aria-label")).toBe("Manual lower");
		expect(inputs[1]?.getAttribute("aria-label")).toBe("Root thumb 1");

		unmount();
	});

	it("binds to numeric Field value when scalar value takes precedence over array defaultValue", () => {
		// Given a bound numeric Field with state value 75 and a slider with controlled scalar value 40
		const boundNumberField: BoundNumberField = {
			handleBlur: () => undefined,
			handleChange: () => undefined,
			name: "volume",
			state: {
				meta: {
					errors: [],
					isDirty: false,
					isTouched: false,
					isValid: true,
				},
				value: 75,
			},
		};

		const DynamicSlider: (
			props: SliderProps<number | readonly number[]>
		) => ReactElement = Slider;

		// When mounting the Slider inside the bound Field
		const { container, unmount } = mount(
			<Field field={boundNumberField}>
				<DynamicSlider aria-label="Volume" defaultValue={[20, 80]} value={40} />
			</Field>
		);

		// Then the rendered native range input uses the Field-owned scalar value
		const input = container.querySelector<HTMLInputElement>("input");
		expect(input?.value).toBe("75");

		unmount();
	});
});
