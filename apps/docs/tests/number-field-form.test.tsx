// @vitest-environment happy-dom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	Field,
	FieldError,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import {
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
} from "../../../packages/ui/src/components/number-field/number-field";
import { useForm } from "../../../packages/ui/src/form";
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

describe("TanStack Form integration with NumberField", () => {
	it("binds name and initial numeric value from real useForm field state", () => {
		function TestForm() {
			const form = useForm({
				defaultValues: { quantity: 42 as number | null },
			});
			return (
				<form>
					<form.Field name="quantity">
						{(field) => (
							<Field field={field}>
								<FieldLabel>Quantity</FieldLabel>
								<NumberField>
									<NumberFieldGroup>
										<NumberFieldDecrement />
										<NumberFieldInput />
										<NumberFieldIncrement />
									</NumberFieldGroup>
								</NumberField>
								<FieldError />
							</Field>
						)}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const hiddenInput = container.querySelector<HTMLInputElement>(
			'input[type="number"]'
		);

		expect(input?.value).toBe("42");
		expect(hiddenInput?.name).toBe("quantity");
		expect(hiddenInput?.value).toBe("42");

		unmount();
	});

	it("propagates step changes to TanStack form state and composes user callbacks", () => {
		let latestValue: number | null = null;
		const userOnValueChange = vi.fn();

		function TestForm() {
			const form = useForm({
				defaultValues: { count: 10 as number | null },
			});
			return (
				<form>
					<form.Field name="count">
						{(field) => {
							latestValue = field.state.value;
							return (
								<Field field={field}>
									<NumberField onValueChange={userOnValueChange}>
										<NumberFieldGroup>
											<NumberFieldDecrement />
											<NumberFieldInput />
											<NumberFieldIncrement />
										</NumberFieldGroup>
									</NumberField>
								</Field>
							);
						}}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const inc = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);

		expect(latestValue).toBe(10);
		act(() => {
			inc?.click();
		});

		expect(latestValue).toBe(11);
		expect(userOnValueChange).toHaveBeenCalledWith(11, expect.anything());
		unmount();
	});

	it("honors consumer cancellation without updating bound form state", () => {
		let latestValue: number | null = null;
		const userOnValueChange = vi.fn(
			(_val: number | null, details: { cancel: () => void }) => {
				details.cancel();
			}
		);

		function TestForm() {
			const form = useForm({
				defaultValues: { count: 10 as number | null },
			});
			return (
				<form>
					<form.Field name="count">
						{(field) => {
							latestValue = field.state.value;
							return (
								<Field field={field}>
									<NumberField onValueChange={userOnValueChange}>
										<NumberFieldGroup>
											<NumberFieldDecrement />
											<NumberFieldInput />
											<NumberFieldIncrement />
										</NumberFieldGroup>
									</NumberField>
								</Field>
							);
						}}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const inc = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);

		expect(input?.value).toBe("10");
		act(() => {
			inc?.click();
		});

		expect(userOnValueChange).toHaveBeenCalledTimes(1);
		expect(latestValue).toBe(10);
		expect(input?.value).toBe("10");
		unmount();
	});

	it("updates touched state on blur and composes user onBlur", () => {
		let isFieldTouched = false;
		const userOnBlur = vi.fn();

		function TestForm() {
			const form = useForm({
				defaultValues: { score: 100 as number | null },
			});
			return (
				<form>
					<form.Field name="score">
						{(field) => {
							isFieldTouched = field.state.meta.isTouched;
							return (
								<Field field={field}>
									<NumberField>
										<NumberFieldGroup>
											<NumberFieldInput onBlur={userOnBlur} />
										</NumberFieldGroup>
									</NumberField>
								</Field>
							);
						}}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);

		expect(isFieldTouched).toBe(false);
		act(() => {
			input?.focus();
			input?.blur();
		});

		expect(isFieldTouched).toBe(true);
		expect(userOnBlur).toHaveBeenCalled();
		unmount();
	});
});
