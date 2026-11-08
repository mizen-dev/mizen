// @vitest-environment happy-dom
import { act, useCallback } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Field,
	FieldError,
} from "../../../packages/ui/src/components/field/field";
import {
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
} from "../../../packages/ui/src/components/number-field/number-field";
import {
	focusFirstInvalidControl,
	useForm,
} from "../../../packages/ui/src/form";
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
describe("TanStack Form validation and mismatch safety with NumberField", () => {
	it("safely ignores mismatched string field binding in NumberField", () => {
		const handleStringChange = vi.fn();
		const stringField = {
			handleBlur: vi.fn(),
			handleChange: handleStringChange,
			name: "username",
			state: {
				meta: {
					errors: [],
					isDirty: false,
					isTouched: false,
					isValid: true,
				},
				value: "alice",
			},
		};
		const { container, unmount } = mount(
			<Field field={stringField}>
				<NumberField defaultValue={5}>
					<NumberFieldGroup>
						<NumberFieldDecrement />
						<NumberFieldInput />
						<NumberFieldIncrement />
					</NumberFieldGroup>
				</NumberField>
			</Field>
		);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const inc = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);
		expect(input?.value).toBe("5");
		act(() => {
			inc?.click();
		});
		expect(input?.value).toBe("6");
		expect(handleStringChange).not.toHaveBeenCalled();
		unmount();
	});
	it("surfaces validation error and focuses visible input on invalid submission", () => {
		const { container, unmount } = mount(<TestForm />);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const formEl = container.querySelector("form");
		act(() => {
			input?.focus();
			input?.blur();
		});
		expect(container.textContent).toContain("Must be at least 18");
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		act(() => {
			formEl?.dispatchEvent(
				new Event("submit", {
					bubbles: true,
					cancelable: true,
				})
			);
		});
		expect(document.activeElement).toBe(input);
		unmount();
	});
});
function TestForm() {
	const form = useForm({
		defaultValues: {
			age: 15 as number | null,
		},
	});
	const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		focusFirstInvalidControl(e.currentTarget);
	}, []);
	return (
		<form onSubmit={handleSubmit}>
			<form.Field
				name="age"
				validators={{
					onBlur: ({ value }: { value: number | null }) =>
						typeof value === "number" && value < 18
							? "Must be at least 18"
							: undefined,
				}}
			>
				{(field) => (
					<Field field={field}>
						<NumberField>
							<NumberFieldGroup>
								<NumberFieldInput />
							</NumberFieldGroup>
						</NumberField>
						<FieldError />
					</Field>
				)}
			</form.Field>
			<button type="submit">Submit</button>
		</form>
	);
}
