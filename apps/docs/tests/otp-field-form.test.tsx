// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Field,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import { OTPField } from "../../../packages/ui/src/components/otp-field/otp-field";
import { useForm } from "../../../packages/ui/src/form";
import { mount, setInputValue } from "./form-test-helpers";

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
describe("TanStack Form integration with OTPField", () => {
	it("binds name and initial string value from real useForm field state", () => {
		// Given: a bound string field with default value "1234"

		// When: mounting the form into the document
		const { container, unmount } = mount(<InitialValueForm />);

		// Then: slot inputs render the individual characters and a hidden input carries the bound name and value
		const inputs = container.querySelectorAll<HTMLInputElement>(
			'[data-slot="otp-field-input"]'
		);
		const hiddenInput =
			container.querySelector<HTMLInputElement>('input[name="code"]');
		expect(inputs).toHaveLength(4);
		const [slot0, slot1, slot2, slot3] = Array.from(inputs);
		expect(slot0?.value).toBe("1");
		expect(slot1?.value).toBe("2");
		expect(slot2?.value).toBe("3");
		expect(slot3?.value).toBe("4");
		expect(hiddenInput?.name).toBe("code");
		expect(hiddenInput?.value).toBe("1234");
		unmount();
	});
	it("propagates input changes to TanStack form state and composes user onValueChange", () => {
		// Given: a bound string field with an empty default value and a user callback
		let latestValue = "";
		const userOnValueChange = vi.fn();
		const onLatestValue: ComponentProps<
			typeof ValueChangeForm
		>["onLatestValue"] = (value) => {
			latestValue = value;
		};
		const { container, unmount } = mount(
			<ValueChangeForm
				onLatestValue={onLatestValue}
				userOnValueChange={userOnValueChange}
			/>
		);
		const firstSlot = container.querySelector('[data-slot="otp-field-input"]');
		expect(latestValue).toBe("");
		expect(firstSlot instanceof HTMLInputElement).toBe(true);

		// When: typing "7" into the first slot
		if (firstSlot instanceof HTMLInputElement) {
			act(() => {
				setInputValue(firstSlot, "7");
			});
		}

		// Then: the user callback is composed and TanStack form state is updated
		expect(userOnValueChange).toHaveBeenCalledWith("7", expect.anything());
		expect(latestValue).toBe("7");
		unmount();
	});
	it("updates touched state on composite blur and composes user onBlur", () => {
		// Given: a bound string field with a user onBlur callback and an external focusable button
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
		const firstSlot = container.querySelector('[data-slot="otp-field-input"]');
		const externalButton = container.querySelector("button");
		expect(isFieldTouched).toBe(false);
		expect(firstSlot instanceof HTMLInputElement).toBe(true);
		expect(externalButton instanceof HTMLButtonElement).toBe(true);

		// When: focusing the first OTP slot and moving focus to the external button
		if (
			firstSlot instanceof HTMLInputElement &&
			externalButton instanceof HTMLButtonElement
		) {
			act(() => {
				firstSlot.focus();
				externalButton.focus();
			});
		}

		// Then: the user onBlur callback is composed and TanStack touched state is set to true
		expect(userOnBlur).toHaveBeenCalled();
		expect(isFieldTouched).toBe(true);
		unmount();
	});
	it("honors consumer cancellation without updating bound form state", () => {
		// Given: a bound string field with initial value "12" and a cancelling onValueChange callback
		let latestValue = "12";
		const userOnValueChange = vi.fn(
			(
				_val: string,
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
		const firstSlot = container.querySelector('[data-slot="otp-field-input"]');
		expect(latestValue).toBe("12");
		expect(firstSlot instanceof HTMLInputElement).toBe(true);

		// When: typing "9" into the first slot
		if (firstSlot instanceof HTMLInputElement) {
			act(() => {
				setInputValue(firstSlot, "9");
			});
		}

		// Then: the consumer callback was invoked, but bound TanStack form state was not updated
		expect(userOnValueChange).toHaveBeenCalledTimes(1);
		expect(latestValue).toBe("12");
		unmount();
	});
	it("invokes consumer onBlur but does not mark field touched when focus moves between internal slots", () => {
		// Given: a bound string field with a consumer onBlur callback
		let isFieldTouched = false;
		const userOnBlur = vi.fn();
		const onIsFieldTouched: ComponentProps<
			typeof InternalFocusForm
		>["onIsFieldTouched"] = (value) => {
			isFieldTouched = value;
		};
		const { container, unmount } = mount(
			<InternalFocusForm
				onIsFieldTouched={onIsFieldTouched}
				userOnBlur={userOnBlur}
			/>
		);
		const slots = container.querySelectorAll('[data-slot="otp-field-input"]');
		const firstSlot = slots.item(0);
		const secondSlot = slots.item(1);
		expect(isFieldTouched).toBe(false);
		expect(firstSlot instanceof HTMLInputElement).toBe(true);
		expect(secondSlot instanceof HTMLInputElement).toBe(true);

		// When: moving focus from the first slot to the second slot
		if (
			firstSlot instanceof HTMLInputElement &&
			secondSlot instanceof HTMLInputElement
		) {
			act(() => {
				firstSlot.focus();
				secondSlot.focus();
			});
		}

		// Then: root consumer onBlur is called, but TanStack field remains untouched
		expect(userOnBlur).toHaveBeenCalled();
		expect(isFieldTouched).toBe(false);
		unmount();
	});
});
function InitialValueForm() {
	const form = useForm({
		defaultValues: {
			code: "1234",
		},
	});
	return (
		<form>
			<form.Field name="code">
				{(field) => (
					<Field field={field}>
						<FieldLabel>Verification code</FieldLabel>
						<OTPField length={4} />
					</Field>
				)}
			</form.Field>
		</form>
	);
}
function ValueChangeForm({
	onLatestValue,
	userOnValueChange,
}: {
	onLatestValue: (value: string) => void;
	userOnValueChange: NonNullable<
		ComponentProps<typeof OTPField>["onValueChange"]
	>;
}) {
	const form = useForm({
		defaultValues: {
			code: "",
		},
	});
	return (
		<form>
			<form.Field name="code">
				{(field) => {
					onLatestValue(field.state.value);
					return (
						<Field field={field}>
							<FieldLabel>Verification code</FieldLabel>
							<OTPField length={4} onValueChange={userOnValueChange} />
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
	userOnBlur: NonNullable<ComponentProps<typeof OTPField>["onBlur"]>;
}) {
	const form = useForm({
		defaultValues: {
			code: "",
		},
	});
	return (
		<form>
			<form.Field name="code">
				{(field) => {
					onIsFieldTouched(field.state.meta.isTouched);
					return (
						<Field field={field}>
							<FieldLabel>Verification code</FieldLabel>
							<OTPField length={4} onBlur={userOnBlur} />
						</Field>
					);
				}}
			</form.Field>
			<button type="button">Next control</button>
		</form>
	);
}
function CancellationForm({
	onLatestValue,
	userOnValueChange,
}: {
	onLatestValue: (value: string) => void;
	userOnValueChange: NonNullable<
		ComponentProps<typeof OTPField>["onValueChange"]
	>;
}) {
	const form = useForm({
		defaultValues: {
			code: "12",
		},
	});
	return (
		<form>
			<form.Field name="code">
				{(field) => {
					onLatestValue(field.state.value);
					return (
						<Field field={field}>
							<FieldLabel>Verification code</FieldLabel>
							<OTPField length={4} onValueChange={userOnValueChange} />
						</Field>
					);
				}}
			</form.Field>
		</form>
	);
}
function InternalFocusForm({
	onIsFieldTouched,
	userOnBlur,
}: {
	onIsFieldTouched: (value: boolean) => void;
	userOnBlur: NonNullable<ComponentProps<typeof OTPField>["onBlur"]>;
}) {
	const form = useForm({
		defaultValues: {
			code: "",
		},
	});
	return (
		<form>
			<form.Field name="code">
				{(field) => {
					onIsFieldTouched(field.state.meta.isTouched);
					return (
						<Field field={field}>
							<FieldLabel>Verification code</FieldLabel>
							<OTPField length={4} onBlur={userOnBlur} />
						</Field>
					);
				}}
			</form.Field>
		</form>
	);
}
