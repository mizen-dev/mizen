// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
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
	when: {
		ancestor: () => ":where(*)",
	},
}));
describe("TanStack Form integration with NumberField", () => {
	it("binds name and initial numeric value from real useForm field state", () => {
		const { container, unmount } = mount(<InitialValueForm />);
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
		const onLatestValue: ComponentProps<
			typeof StepChangeForm
		>["onLatestValue"] = (value) => {
			latestValue = value;
		};
		const { container, unmount } = mount(
			<StepChangeForm
				onLatestValue={onLatestValue}
				userOnValueChange={userOnValueChange}
			/>
		);
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
			(
				_val: number | null,
				details: {
					cancel: () => void;
				}
			) => {
				details.cancel();
			}
		);
		const onLatestValue: ComponentProps<
			typeof CancellationForm
		>["onLatestValue"] = (value) => {
			latestValue = value;
		};
		const { container, unmount } = mount(
			<CancellationForm
				onLatestValue={onLatestValue}
				userOnValueChange={userOnValueChange}
			/>
		);
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
		const onIsFieldTouched: ComponentProps<
			typeof BlurForm
		>["onIsFieldTouched"] = (value) => {
			isFieldTouched = value;
		};
		const { container, unmount } = mount(
			<BlurForm onIsFieldTouched={onIsFieldTouched} userOnBlur={userOnBlur} />
		);
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
function InitialValueForm() {
	const form = useForm({
		defaultValues: {
			quantity: 42 as number | null,
		},
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
function StepChangeForm({
	onLatestValue,
	userOnValueChange,
}: {
	onLatestValue: (value: number | null) => void;
	userOnValueChange: NonNullable<
		ComponentProps<typeof NumberField>["onValueChange"]
	>;
}) {
	const form = useForm({
		defaultValues: {
			count: 10 as number | null,
		},
	});
	return (
		<form>
			<form.Field name="count">
				{(field) => {
					onLatestValue(field.state.value);
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
function CancellationForm({
	onLatestValue,
	userOnValueChange,
}: {
	onLatestValue: (value: number | null) => void;
	userOnValueChange: NonNullable<
		ComponentProps<typeof NumberField>["onValueChange"]
	>;
}) {
	const form = useForm({
		defaultValues: {
			count: 10 as number | null,
		},
	});
	return (
		<form>
			<form.Field name="count">
				{(field) => {
					onLatestValue(field.state.value);
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
function BlurForm({
	onIsFieldTouched,
	userOnBlur,
}: {
	onIsFieldTouched: (value: boolean) => void;
	userOnBlur: NonNullable<ComponentProps<typeof NumberFieldInput>["onBlur"]>;
}) {
	const form = useForm({
		defaultValues: {
			score: 100 as number | null,
		},
	});
	return (
		<form>
			<form.Field name="score">
				{(field) => {
					onIsFieldTouched(field.state.meta.isTouched);
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
