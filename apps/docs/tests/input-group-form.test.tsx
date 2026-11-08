// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FieldError,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "../../../packages/ui/src/components/input-group/input-group";
import { useForm } from "../../../packages/ui/src/form";
import { mount, renderBoundField } from "./form-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
function InitialValueForm() {
	const form = useForm({
		defaultValues: {
			bio: "Developer at Mizen",
		},
	});
	return (
		<form>
			<form.Field name="bio">
				{(field) =>
					renderBoundField(
						field,
						<FieldLabel>Bio</FieldLabel>,
						<InputGroup>
							<InputGroupTextarea />
							<InputGroupAddon align="block-end">
								<InputGroupText>Characters</InputGroupText>
							</InputGroupAddon>
						</InputGroup>,
						<FieldError />
					)
				}
			</form.Field>
		</form>
	);
}
function ValueChangeForm({
	onLatestFieldValue,
	userOnChange,
}: {
	onLatestFieldValue: (value: string) => void;
	userOnChange: NonNullable<
		ComponentProps<typeof InputGroupTextarea>["onChange"]
	>;
}) {
	const form = useForm({
		defaultValues: {
			notes: "Initial note",
		},
	});
	return (
		<form>
			<form.Field name="notes">
				{(field) => {
					onLatestFieldValue(field.state.value);
					return renderBoundField(
						field,
						<FieldLabel>Notes</FieldLabel>,
						<InputGroup>
							<InputGroupTextarea onChange={userOnChange} />
						</InputGroup>
					);
				}}
			</form.Field>
		</form>
	);
}
function BlurValidationForm({
	userOnBlur,
}: {
	userOnBlur: NonNullable<ComponentProps<typeof InputGroupTextarea>["onBlur"]>;
}) {
	const form = useForm({
		defaultValues: {
			feedback: "",
		},
	});
	return (
		<form>
			<form.Field
				name="feedback"
				validators={{
					onChange: ({ value }) =>
						value.length < 5 ? "Feedback must be at least 5 chars" : undefined,
				}}
			>
				{(field) =>
					renderBoundField(
						field,
						<FieldLabel>Feedback</FieldLabel>,
						<InputGroup>
							<InputGroupTextarea onBlur={userOnBlur} />
						</InputGroup>,
						<FieldError />
					)
				}
			</form.Field>
		</form>
	);
}
function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
	const nativeSetter = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value"
	)?.set;
	if (nativeSetter) {
		nativeSetter.call(textarea, value);
	} else {
		textarea.value = value;
	}
	textarea.dispatchEvent(
		new Event("input", {
			bubbles: true,
		})
	);
	textarea.dispatchEvent(
		new Event("change", {
			bubbles: true,
		})
	);
}
describe("InputGroupTextarea TanStack Form field binding and propagation", () => {
	it("binds textarea name and initial value from form field state", () => {
		const { container, unmount } = mount(<InitialValueForm />);
		const textarea = container.querySelector("textarea");
		expect(textarea).not.toBeNull();
		expect(textarea?.getAttribute("name")).toBe("bio");
		expect(textarea?.value).toBe("Developer at Mizen");
		unmount();
	});
	it("propagates value changes to form state and composes user onChange callback", () => {
		let latestFieldValue = "";
		const userOnChange = vi.fn();
		const onLatestFieldValue: ComponentProps<
			typeof ValueChangeForm
		>["onLatestFieldValue"] = (value) => {
			latestFieldValue = value;
		};
		const { container, unmount } = mount(
			<ValueChangeForm
				onLatestFieldValue={onLatestFieldValue}
				userOnChange={userOnChange}
			/>
		);
		const textarea = container.querySelector("textarea");
		expect(textarea).not.toBeNull();
		if (!textarea) {
			throw new Error("Textarea missing");
		}
		act(() => {
			setTextareaValue(textarea, "Updated note text");
		});
		expect(userOnChange).toHaveBeenCalledTimes(1);
		expect(latestFieldValue).toBe("Updated note text");
		expect(textarea.value).toBe("Updated note text");
		unmount();
	});
	it("handles blur and derives invalid state from touched + invalid field meta", () => {
		const userOnBlur = vi.fn();
		const { container, unmount } = mount(
			<BlurValidationForm userOnBlur={userOnBlur} />
		);
		const textarea = container.querySelector("textarea");
		expect(textarea).not.toBeNull();
		if (!textarea) {
			throw new Error("Textarea missing");
		}
		expect(textarea.getAttribute("aria-invalid")).toBeNull();
		act(() => {
			setTextareaValue(textarea, "Hi");
			textarea.focus();
			textarea.blur();
		});
		expect(userOnBlur).toHaveBeenCalledTimes(1);
		expect(textarea.getAttribute("aria-invalid")).toBe("true");
		const describedBy = textarea.getAttribute("aria-describedby");
		const errorEl = describedBy
			? container.querySelector(`#${describedBy}`)
			: container.querySelector('[data-slot="field-error"]');
		expect(errorEl?.textContent).toContain("Feedback must be at least 5 chars");
		unmount();
	});
});
