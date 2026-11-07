// @vitest-environment happy-dom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	BoundFieldProvider,
	type BoundStringField,
} from "../../../packages/ui/src/components/field/field-context";
import {
	Input,
	type InputProps,
} from "../../../packages/ui/src/components/input/input";

const mockCapture = vi.hoisted(() => ({ props: null as unknown }));

vi.mock(
	"../../../packages/ui/node_modules/@base-ui/react/input/index.mjs",
	() => ({
		Input: (inputProps: unknown) => {
			mockCapture.props = inputProps;
			return null;
		},
	})
);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(vars: T): T => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const field: BoundStringField = {
	handleBlur: vi.fn(),
	handleChange: vi.fn(),
	name: "title",
	state: {
		meta: { errors: [], isDirty: false, isTouched: false, isValid: true },
		value: "before",
	},
};
describe("Input bound value changes", () => {
	beforeEach(() => vi.clearAllMocks());

	it("does not update the bound field when the consumer cancels a change", () => {
		const onValueChange: NonNullable<InputProps["onValueChange"]> = vi.fn(
			(_value, changeDetails) => changeDetails.cancel()
		);

		renderToStaticMarkup(
			createElement(
				BoundFieldProvider,
				{ value: field },
				createElement(Input, { onValueChange })
			)
		);

		const inputProps = mockCapture.props as {
			onValueChange: NonNullable<InputProps["onValueChange"]>;
		};
		const details = {
			cancel() {
				this.isCanceled = true;
			},
			isCanceled: false,
		};
		inputProps.onValueChange("after", details as never);

		expect(onValueChange).toHaveBeenCalledOnce();
		expect(field.handleChange).not.toHaveBeenCalled();
	});

	it("updates the bound field for a change that was not canceled", () => {
		renderToStaticMarkup(
			createElement(
				BoundFieldProvider,
				{ value: field },
				createElement(Input, {})
			)
		);

		const inputProps = mockCapture.props as {
			onValueChange: NonNullable<InputProps["onValueChange"]>;
		};
		inputProps.onValueChange("after", { isCanceled: false } as never);

		expect(field.handleChange).toHaveBeenCalledWith("after");
	});
});
