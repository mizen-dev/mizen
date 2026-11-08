// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act, createRef } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { DateTimeInput } from "../../../packages/ui/src/components/date-time-input/date-time-input";
import {
	Field,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import { useForm } from "../../../packages/ui/src/form";
import { mount, setInputValue } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(vars: T): T => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
describe("DateTimeInput", () => {
	it("keeps the local value and prevents a canceled change from updating its bound field", () => {
		let latestValue = "";
		const onValueChange = vi.fn(
			(
				_value: string,
				details: {
					cancel: () => void;
				}
			) => details.cancel()
		);
		const onLatestValue: ComponentProps<typeof TestForm>["onLatestValue"] = (
			value
		) => {
			latestValue = value;
		};
		const { container, unmount } = mount(
			<TestForm onLatestValue={onLatestValue} onValueChange={onValueChange} />
		);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="date-time-input"]'
		);
		expect(input?.type).toBe("datetime-local");
		expect(input?.value).toBe("2026-10-07T09:30");
		if (!input) {
			throw new Error("Date-time input was not rendered");
		}
		act(() => setInputValue(input, "2026-10-07T10:00"));
		expect(onValueChange).toHaveBeenCalledOnce();
		expect(latestValue).toBe("2026-10-07T09:30");
		unmount();
	});
	it("forwards its input ref and keeps native form reset behavior", () => {
		const inputRef = createRef<HTMLInputElement>();
		const { container, unmount } = mount(
			<form>
				<DateTimeInput
					defaultValue="2026-10-07T09:30"
					max="2026-10-31T23:59"
					min="2026-10-01T00:00"
					name="startsAt"
					ref={inputRef}
					required
					step={60}
				/>
			</form>
		);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="date-time-input"]'
		);
		const form = container.querySelector("form");
		expect(inputRef.current).toBe(input);
		expect(input?.value).toBe("2026-10-07T09:30");
		expect(input?.min).toBe("2026-10-01T00:00");
		expect(input?.max).toBe("2026-10-31T23:59");
		expect(input?.step).toBe("60");
		expect(input?.required).toBe(true);
		if (!(input && form)) {
			throw new Error("Form or date-time input was not rendered");
		}
		act(() => {
			input.value = "2026-10-07T10:00";
			form.reset();
		});
		expect(input.value).toBe("2026-10-07T09:30");
		unmount();
	});
});
function TestForm({
	onLatestValue,
	onValueChange,
}: {
	onLatestValue: (value: string) => void;
	onValueChange: NonNullable<
		ComponentProps<typeof DateTimeInput>["onValueChange"]
	>;
}) {
	const form = useForm({
		defaultValues: {
			startsAt: "2026-10-07T09:30",
		},
	});
	return (
		<form>
			<form.Field name="startsAt">
				{(field) => {
					onLatestValue(field.state.value);
					return (
						<Field field={field}>
							<FieldLabel>Starts at</FieldLabel>
							<DateTimeInput onValueChange={onValueChange} />
						</Field>
					);
				}}
			</form.Field>
		</form>
	);
}
