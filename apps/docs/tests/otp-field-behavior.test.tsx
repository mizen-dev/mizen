// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Field,
	FieldLabel,
} from "../../../packages/ui/src/components/field/field";
import type { OTPFieldProps } from "../../../packages/ui/src/components/otp-field/otp-field";
import {
	OTPField,
	OTPFieldInput,
	OTPFieldSeparator,
} from "../../../packages/ui/src/components/otp-field/otp-field";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const renderOtpRoot: NonNullable<OTPFieldProps["render"]> = (renderProps) => (
	<section {...renderProps} />
);

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => {
		root.render(element);
	});
	return {
		container,
		unmount: () => {
			act(() => {
				root.unmount();
			});
			container.remove();
		},
	};
}

describe("OTPField default anatomy and custom composition seam", () => {
	it("keeps required slot attributes when render returns a custom element", () => {
		const { container, unmount } = mount(
			<OTPField length={1} render={renderOtpRoot} size="sm" />
		);

		const root = container.querySelector("section");
		expect(root?.getAttribute("data-slot")).toBe("otp-field");
		expect(root?.getAttribute("data-size")).toBe("sm");

		unmount();
	});

	it("renders four visible input slots by default when children are omitted", () => {
		// Given: a Field with a label and an OTPField with length 4 and no children
		const element = (
			<Field>
				<FieldLabel>Verification code</FieldLabel>
				<OTPField length={4} />
			</Field>
		);

		// When: the component tree is mounted into the DOM
		const { container, unmount } = mount(element);

		// Then: exactly four visible input slots are rendered
		const inputs = container.querySelectorAll('[data-slot="otp-field-input"]');
		expect(inputs).toHaveLength(4);

		for (const input of inputs) {
			expect(input instanceof HTMLInputElement).toBe(true);
			if (input instanceof HTMLInputElement) {
				expect(input.hidden).toBe(false);
				expect(input.getAttribute("aria-hidden")).toBeNull();
			}
		}

		unmount();
	});

	it("replaces default anatomy when explicit custom children are provided", () => {
		// Given: a Field with an OTPField containing custom inputs and a separator
		const element = (
			<Field>
				<FieldLabel>Verification code</FieldLabel>
				<OTPField length={4}>
					<OTPFieldInput />
					<OTPFieldSeparator />
					<OTPFieldInput />
				</OTPField>
			</Field>
		);

		// When: the component tree is mounted into the DOM
		const { container, unmount } = mount(element);

		// Then: only the custom children are rendered, replacing default anatomy
		const inputs = container.querySelectorAll('[data-slot="otp-field-input"]');
		const separators = container.querySelectorAll(
			'[data-slot="otp-field-separator"]'
		);

		expect(inputs).toHaveLength(2);
		expect(separators).toHaveLength(1);

		for (const input of inputs) {
			expect(input instanceof HTMLInputElement).toBe(true);
			if (input instanceof HTMLInputElement) {
				expect(input.hidden).toBe(false);
			}
		}

		unmount();
	});

	it("propagates size presentation and state attributes to generated slots", () => {
		// Given: an OTPField configured with length 3, small size, mask, disabled, and readOnly props
		const element = <OTPField disabled length={3} mask readOnly size="sm" />;

		// When: the component tree is mounted into the DOM
		const { container, unmount } = mount(element);

		// Then: the root exposes small size presentation
		const root = container.querySelector('[data-slot="otp-field"]');
		expect(root).not.toBeNull();
		if (root !== null) {
			expect(root.getAttribute("data-size")).toBe("sm");
		}

		// And: all visible slots expose small size presentation and inherit state attributes
		const inputs = container.querySelectorAll('[data-slot="otp-field-input"]');
		expect(inputs).toHaveLength(3);

		for (const input of inputs) {
			expect(input instanceof HTMLInputElement).toBe(true);
			if (input instanceof HTMLInputElement) {
				expect(input.type).toBe("password");
				expect(input.disabled).toBe(true);
				expect(input.readOnly).toBe(true);
				expect(input.getAttribute("data-size")).toBe("sm");
			}
		}

		unmount();
	});
});
