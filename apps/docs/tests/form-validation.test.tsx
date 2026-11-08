// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act, useCallback } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FieldError,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import { Input } from "../../../packages/ui/src/components/input/input";
import { useForm } from "../../../packages/ui/src/form";
import { mount, renderBoundField, setInputValue } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
describe("TanStack Form validation and error presentation behavior", () => {
	it("handles field-level string validation, aria-invalid, and FieldError describedBy with pristine-quiet and blur-visible states", () => {
		const { container, unmount } = mount(<FieldValidationForm />);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.getAttribute("aria-invalid")).toBeNull();
		expect(container.querySelector('[data-slot="field-error"]')).toBeNull();
		expect(input?.getAttribute("aria-describedby")).toBeNull();
		act(() => {
			if (input) {
				setInputValue(input, "123");
				input.focus();
				input.blur();
			}
		});
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		const describedBy = input?.getAttribute("aria-describedby");
		expect(describedBy).toBeTruthy();
		const errorEl = describedBy
			? container.querySelector(`#${describedBy}`)
			: null;
		expect(errorEl?.textContent).toContain(
			"Password must be at least 6 characters"
		);
		act(() => {
			if (input) {
				setInputValue(input, "secret123");
			}
		});
		expect(input?.getAttribute("aria-invalid")).toBeNull();
		expect(container.querySelector('[data-slot="field-error"]')).toBeNull();
		unmount();
	});
	it("remains pristine-quiet until form submission triggers visible invalid state", async () => {
		let formInstance: SubmitFormApi | undefined;
		const onFormInstance: ComponentProps<
			typeof SubmitValidationForm
		>["onFormInstance"] = (value) => {
			formInstance = value;
		};
		const { container, unmount } = mount(
			<SubmitValidationForm onFormInstance={onFormInstance} />
		);
		const input = container.querySelector("input");
		expect(input?.getAttribute("aria-invalid")).toBeNull();
		expect(container.querySelector('[data-slot="field-error"]')).toBeNull();
		await act(async () => {
			await formInstance?.handleSubmit();
		});
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		const describedBy = input?.getAttribute("aria-describedby");
		expect(describedBy).toBeTruthy();
		const errorEl = describedBy
			? container.querySelector(`#${describedBy}`)
			: null;
		expect(errorEl?.textContent).toContain("Username is required");
		unmount();
	});
	it("normalizes form-level field error objects containing a string message", () => {
		const { container, unmount } = mount(<FormErrorForm />);
		const input = container.querySelector("input");
		act(() => {
			if (input) {
				setInputValue(input, "XYZ");
			}
		});
		expect(container.textContent).toContain("Invalid promo code format");
		unmount();
	});
	it("gives precedence to explicit FieldError children over bound errors", () => {
		const { container, unmount } = mount(<ExplicitErrorForm />);
		const input = container.querySelector("input");
		act(() => {
			if (input) {
				setInputValue(input, "abc");
			}
		});
		expect(container.textContent).toContain("Explicit custom error override");
		expect(container.textContent).not.toContain(
			"Automatic field error message"
		);
		unmount();
	});
});
type SubmitFormApi = ReturnType<typeof useSubmitForm>;
function FieldValidationForm() {
	const form = useForm({
		defaultValues: {
			password: "",
		},
	});
	return (
		<form>
			<form.Field
				name="password"
				validators={{
					onChange: ({ value }: { value: string }) =>
						value.length < 6
							? "Password must be at least 6 characters"
							: undefined,
				}}
			>
				{(field) =>
					renderBoundField(
						field,
						<FieldLabel>Password</FieldLabel>,
						<Input />,
						<FieldError />
					)
				}
			</form.Field>
		</form>
	);
}
function useSubmitForm() {
	return useForm({
		defaultValues: {
			username: "",
		},
	});
}
function SubmitValidationForm({
	onFormInstance,
}: {
	onFormInstance: (value: SubmitFormApi | undefined) => void;
}) {
	const form = useSubmitForm();
	onFormInstance(form);
	const onSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			e.stopPropagation();
			form.handleSubmit();
		},
		[form]
	);
	return (
		<form onSubmit={onSubmit}>
			<form.Field
				name="username"
				validators={{
					onSubmit: ({ value }: { value: string }) =>
						value.length === 0 ? "Username is required" : undefined,
				}}
			>
				{(field) => renderBoundField(field, <Input />, <FieldError />)}
			</form.Field>
			<button type="submit">Submit</button>
		</form>
	);
}
function FormErrorForm() {
	const form = useForm({
		defaultValues: {
			code: "ABC",
		},
		validators: {
			onChange: () => ({
				fields: {
					code: {
						message: "Invalid promo code format",
					},
				},
			}),
		},
	});
	return (
		<form>
			<form.Field name="code">
				{(field) => renderBoundField(field, <Input />, <FieldError />)}
			</form.Field>
		</form>
	);
}
function ExplicitErrorForm() {
	const form = useForm({
		defaultValues: {
			title: "ab",
		},
	});
	return (
		<form>
			<form.Field
				name="title"
				validators={{
					onChange: () => "Automatic field error message",
				}}
			>
				{(field) =>
					renderBoundField(
						field,
						<Input />,
						<FieldError>Explicit custom error override</FieldError>
					)
				}
			</form.Field>
		</form>
	);
}
