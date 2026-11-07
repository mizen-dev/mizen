// @vitest-environment happy-dom
import { act, useCallback, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	Field,
	FieldError,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import { Input } from "../../../packages/ui/src/components/input/input";
import { Textarea } from "../../../packages/ui/src/components/textarea/textarea";
import { useForm } from "../../../packages/ui/src/form";
import { mount, renderBoundField, setInputValue } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("TanStack Form field binding and propagation behavior", () => {
	it("binds input name and initial value from real useForm field state", () => {
		function TestForm() {
			const form = useForm({
				defaultValues: {
					username: "alice",
				},
			});

			return (
				<form>
					<form.Field name="username">
						{(field) =>
							renderBoundField(
								field,
								<FieldLabel>Username</FieldLabel>,
								<Input />,
								<FieldError />
							)
						}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.getAttribute("name")).toBe("username");
		expect(input?.value).toBe("alice");
		unmount();
	});

	it("propagates input value changes to TanStack form field state and composes user callbacks", () => {
		let latestFieldValue = "";
		const userOnValueChange = vi.fn();

		function TestForm() {
			const form = useForm({
				defaultValues: {
					bio: "developer",
				},
			});

			return (
				<form>
					<form.Field name="bio">
						{(field) => {
							latestFieldValue = field.state.value;
							return renderBoundField(
								field,
								<Input onValueChange={userOnValueChange} />,
								<FieldError />
							);
						}}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.value).toBe("developer");

		act(() => {
			if (input) {
				setInputValue(input, "engineer");
			}
		});

		expect(latestFieldValue).toBe("engineer");
		expect(userOnValueChange).toHaveBeenCalledWith(
			"engineer",
			expect.anything()
		);
		unmount();
	});

	it("updates touched state on blur and composes user onBlur", () => {
		let isFieldTouched = false;
		const userOnBlur = vi.fn();

		function TestForm() {
			const form = useForm({
				defaultValues: {
					email: "test@example.com",
				},
			});

			return (
				<form>
					<form.Field name="email">
						{(field) => {
							isFieldTouched = field.state.meta.isTouched;
							return renderBoundField(
								field,
								<Input onBlur={userOnBlur} />,
								<FieldError />
							);
						}}
					</form.Field>
				</form>
			);
		}

		const { container, unmount } = mount(<TestForm />);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(isFieldTouched).toBe(false);

		act(() => {
			input?.focus();
			input?.blur();
		});

		expect(isFieldTouched).toBe(true);
		expect(userOnBlur).toHaveBeenCalled();
		unmount();
	});

	it("preserves unbound controlled and uncontrolled Field and Input behavior identically", () => {
		function UnboundControlled() {
			const [value, setValue] = useState("initial");
			const handleValueChange = useCallback((next: string) => {
				setValue(next);
			}, []);
			return (
				<Field invalid name="legacy">
					<Input onValueChange={handleValueChange} value={value} />
					<FieldError match>Static error</FieldError>
				</Field>
			);
		}

		const { container, unmount } = mount(<UnboundControlled />);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.value).toBe("initial");
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		expect(container.textContent).toContain("Static error");

		act(() => {
			if (input) {
				setInputValue(input, "updated");
			}
		});

		expect(input?.value).toBe("updated");
		unmount();
	});

	it("extracts metadata and error messages for structural numeric fields", () => {
		const numericField = {
			handleBlur: vi.fn(),
			handleChange: vi.fn(),
			name: "age",
			state: {
				meta: {
					errors: ["Age must be at least 18"],
					isDirty: true,
					isTouched: true,
					isValid: false,
				},
				value: 12,
			},
		};
		const { container, unmount } = mount(
			<Field field={numericField}>
				<FieldError />
			</Field>
		);
		expect(container.textContent).toContain("Age must be at least 18");
		unmount();
	});

	it("safely ignores mismatched numeric field binding in Input and Textarea", () => {
		const handleNumericChange = vi.fn();
		const numericField = {
			handleBlur: vi.fn(),
			handleChange: handleNumericChange,
			name: "quantity",
			state: {
				meta: {
					errors: [],
					isDirty: false,
					isTouched: false,
					isValid: true,
				},
				value: 42,
			},
		};

		const { container: inputEl, unmount: unmountInput } = mount(
			<Field field={numericField}>
				<Input />
			</Field>
		);
		const input = inputEl.querySelector("input");
		expect(input?.value).toBe("");
		act(() => {
			if (input) {
				setInputValue(input, "100");
			}
		});
		expect(handleNumericChange).not.toHaveBeenCalled();
		unmountInput();

		const { container: textareaEl, unmount: unmountTextarea } = mount(
			<Field field={numericField}>
				<Textarea />
			</Field>
		);
		const textarea = textareaEl.querySelector("textarea");
		expect(textarea?.value).toBe("");
		act(() => {
			if (textarea) {
				textarea.value = "text";
				textarea.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});
		expect(handleNumericChange).not.toHaveBeenCalled();
		unmountTextarea();
	});
});
