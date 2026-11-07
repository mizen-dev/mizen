// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { describe, expect, it, vi } from "vitest";
import { FieldLabel } from "../../../packages/ui/src/components/field/field";
import { TimeInput } from "../../../packages/ui/src/components/time-input/time-input";
import { useForm } from "../../../packages/ui/src/form";
import { mount, renderBoundField, setInputValue } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(keyframes: T): T => keyframes,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("TimeInput native form behavior", () => {
	it("keeps time values local and submits the native string value", () => {
		const { container, unmount } = mount(
			h(
				"form",
				{ "aria-label": "Schedule" },
				h(TimeInput, {
					defaultValue: "09:15",
					max: "18:00",
					min: "08:00",
					name: "meeting",
					required: true,
					step: 900,
				})
			)
		);
		const form = container.querySelector("form");
		const input = container.querySelector<HTMLInputElement>("input");
		expect(form).not.toBeNull();
		expect(input).not.toBeNull();
		if (!(form && input)) {
			throw new Error("Time input form was not rendered");
		}

		expect(input.type).toBe("time");
		expect(input.value).toBe("09:15");
		expect(input.min).toBe("08:00");
		expect(input.max).toBe("18:00");
		expect(input.step).toBe("900");
		expect(input.required).toBe(true);
		expect(input.dataset.slot).toBe("time-input");
		expect(new FormData(form).get("meeting")).toBe("09:15");

		input.value = "10:30";
		form.reset();
		expect(input.value).toBe("09:15");
		unmount();
	});

	it("binds through the shared Field context", () => {
		let latestValue = "";

		function TestForm() {
			const form = useForm({ defaultValues: { startsAt: "09:00" } });
			return (
				<form>
					<form.Field name="startsAt">
						{(field) => {
							latestValue = field.state.value;
							return renderBoundField(
								field,
								<FieldLabel>Start time</FieldLabel>,
								<TimeInput aria-label="Start time" />
							);
						}}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(h(TestForm));
		const input = container.querySelector<HTMLInputElement>("input");
		expect(input?.name).toBe("startsAt");
		expect(input?.value).toBe("09:00");
		if (!input) {
			throw new Error("Time input was not rendered");
		}

		act(() => setInputValue(input, "10:30"));
		expect(latestValue).toBe("10:30");
		expect(input.value).toBe("10:30");
		unmount();
	});
});
