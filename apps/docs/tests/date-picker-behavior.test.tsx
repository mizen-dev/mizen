// @vitest-environment happy-dom
import { act, createRef, createElement as h, useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { DatePicker } from "../../../packages/ui/src/components/date-picker/date-picker";
import { findDayButton, mount } from "./calendar-test-helpers";
import { setInputValue } from "./date-picker-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
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
describe("DatePicker component behavior", () => {
	it("blocks native submission for invalid drafts and clears stale validity after controlled updates", () => {
		const onSubmit = vi.fn();
		const inputRef = createRef<HTMLInputElement>();
		const { container, unmount } = mount(
			h(FormConsumer, {
				inputRef,
				onSubmit,
			})
		);
		const form = container.querySelector("form");
		const input = inputRef.current;
		const submitButton = container.querySelector<HTMLButtonElement>(
			'button[type="submit"]'
		);
		expect(form).not.toBeNull();
		expect(input).not.toBeNull();
		expect(submitButton).not.toBeNull();
		if (!(form && input && submitButton)) {
			return;
		}
		act(() => input.focus());
		act(() => setInputValue(input, "2026-02-30"));
		const enter = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			key: "Enter",
		});
		act(() => input.dispatchEvent(enter));
		expect(enter.defaultPrevented).toBe(true);
		expect(form.checkValidity()).toBe(false);
		expect(input.validity.customError).toBe(true);
		act(() => form.requestSubmit(submitButton));
		expect(onSubmit).not.toHaveBeenCalled();
		act(() => setInputValue(input, "2026-02-28"));
		expect(input.validity.customError).toBe(false);
		expect(form.checkValidity()).toBe(true);
		act(() => setInputValue(input, "2026-02-30"));
		act(() => input.blur());
		expect(input.validity.customError).toBe(true);
		act(() =>
			container
				.querySelector<HTMLButtonElement>(
					'[data-testid="date-picker-form-set-date"]'
				)
				?.click()
		);
		expect(input.validity.customError).toBe(false);
		expect(input.validity.valid).toBe(true);
		act(() => form.requestSubmit(submitButton));
		expect(onSubmit).toHaveBeenCalledTimes(1);
		unmount();
		expect(inputRef.current).toBeNull();
	});
	it("restores its default value and clears draft validity on native form reset", async () => {
		const defaultValue = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(
				"form",
				{},
				h(DatePicker, {
					defaultValue,
					name: "date",
				}),
				h(
					"button",
					{
						type: "reset",
					},
					"Reset"
				)
			)
		);
		const form = container.querySelector<HTMLFormElement>("form");
		const input = container.querySelector<HTMLInputElement>("input");
		expect(form).not.toBeNull();
		expect(input).not.toBeNull();
		if (!(form && input)) {
			return;
		}
		act(() => input.focus());
		act(() => setInputValue(input, "2026-02-30"));
		act(() => input.blur());
		expect(input.validity.customError).toBe(true);
		await act(async () => {
			form.reset();
			await Promise.resolve();
		});
		expect(input.value).toBe("2026-10-03");
		expect(input.validity.customError).toBe(false);
		expect(input.getAttribute("aria-invalid")).toBeNull();
		act(() => input.focus());
		act(() => setInputValue(input, "2026-10-15"));
		act(() => input.blur());
		expect(input.value).toBe("2026-10-15");
		await act(async () => {
			form.reset();
			await Promise.resolve();
		});
		expect(input.value).toBe("2026-10-03");
		unmount();
	});
	it("renders initial value in ISO format YYYY-MM-DD", () => {
		const initial = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.value).toBe("2026-10-03");
		unmount();
	});
	it("commits valid ISO text on blur and triggers onValueChange", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(
			h(DatePicker, {
				onValueChange,
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}
		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-15");
		});
		act(() => {
			input.blur();
		});
		expect(onValueChange).toHaveBeenCalledTimes(1);
		const committed = onValueChange.mock.calls[0]?.[0];
		expect(committed).toBeInstanceOf(Date);
		expect(committed?.getFullYear()).toBe(2026);
		expect(committed?.getMonth()).toBe(9);
		expect(committed?.getDate()).toBe(15);
		expect(input.getAttribute("aria-invalid")).toBeNull();
		unmount();
	});
	it("keeps invalid text visible and sets aria-invalid without calling onValueChange on blur", () => {
		const onValueChange = vi.fn();
		const initial = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
				onValueChange,
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}
		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-02-29"); // invalid leap day
		});
		act(() => {
			input.blur();
		});
		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.value).toBe("2026-02-29");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		unmount();
	});
	it("restores latest committed value on Escape key in text input", () => {
		const initial = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
				minValue: new Date(2026, 9, 4),
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}
		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-99-99");
		});
		act(() => {
			input.dispatchEvent(
				new KeyboardEvent("keydown", {
					bubbles: true,
					key: "Escape",
				})
			);
		});
		expect(input.value).toBe("2026-10-03");
		expect(input.getAttribute("aria-invalid")).toBeNull();
		expect(input.validity.customError).toBe(true);
		unmount();
	});
	it("clears value to undefined when blank text is committed if not required", () => {
		const onValueChange = vi.fn();
		const initial = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
				onValueChange,
				required: false,
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}
		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "");
		});
		act(() => {
			input.blur();
		});
		expect(onValueChange).toHaveBeenCalledWith(undefined);
		expect(input.value).toBe("");
		expect(input.getAttribute("aria-invalid")).toBeNull();
		unmount();
	});
	it("rejects blank input when required is true", () => {
		const onValueChange = vi.fn();
		const initial = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
				onValueChange,
				required: true,
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}
		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "");
		});
		act(() => {
			input.blur();
		});
		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.getAttribute("aria-invalid")).toBe("true");
		unmount();
	});
	it("names the calendar button with triggerLabel", () => {
		const { container, unmount } = mount(
			h(DatePicker, { triggerLabel: "Открыть календарь" })
		);
		const labels = [...container.querySelectorAll("button")].map((button) =>
			button.getAttribute("aria-label")
		);
		expect(labels).toEqual(["Открыть календарь"]);
		unmount();
	});
	it("opens calendar on trigger button click and allows day selection", () => {
		const onValueChange = vi.fn();
		const initial = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
				onValueChange,
			})
		);
		const triggerButton = container.querySelector(
			'button[aria-label="Open calendar"]'
		);
		expect(triggerButton).not.toBeNull();
		act(() => {
			(triggerButton as HTMLButtonElement).click();
		});
		const day15 = findDayButton(document.body, 15, "June", 2026);
		expect(day15).toBeDefined();
		act(() => {
			day15.click();
		});
		expect(onValueChange).toHaveBeenCalledTimes(1);
		const selected = onValueChange.mock.calls[0]?.[0];
		expect(selected).toBeInstanceOf(Date);
		expect(selected?.getDate()).toBe(15);
		unmount();
	});
	it("supports readOnly mode: input is readonly, clicking day does not commit", () => {
		const onValueChange = vi.fn();
		const initial = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(DatePicker, {
				defaultValue: initial,
				onValueChange,
				readOnly: true,
			})
		);
		const input = container.querySelector("input");
		expect(input?.readOnly).toBe(true);
		const triggerButton = container.querySelector(
			'button[aria-label="Open calendar"]'
		);
		act(() => {
			(triggerButton as HTMLButtonElement).click();
		});
		const day15 = findDayButton(document.body, 15, "June", 2026);
		act(() => {
			day15.click();
		});
		expect(onValueChange).not.toHaveBeenCalled();
		unmount();
	});
	it("supports disabled mode: input and trigger are disabled", () => {
		const { container, unmount } = mount(
			h(DatePicker, {
				disabled: true,
			})
		);
		const input = container.querySelector("input");
		const triggerButton = container.querySelector(
			'button[aria-label="Open calendar"]'
		);
		expect(input?.disabled).toBe(true);
		expect((triggerButton as HTMLButtonElement)?.disabled).toBe(true);
		unmount();
	});
});
function FormConsumer({
	onSubmit,
	inputRef,
}: {
	onSubmit: () => void;
	inputRef: ReturnType<typeof createRef<HTMLInputElement>>;
}) {
	const [value, setValue] = useState<Date | undefined>();
	return h(
		"form",
		{
			onSubmit: (event) => {
				event.preventDefault();
				onSubmit();
			},
		},
		h(DatePicker, {
			name: "date",
			onValueChange: setValue,
			ref: inputRef,
			value,
		}),
		h(
			"button",
			{
				"data-testid": "date-picker-form-set-date",
				onClick: () => setValue(new Date(2026, 9, 15)),
				type: "button",
			},
			"Set date"
		),
		h(
			"button",
			{
				type: "submit",
			},
			"Submit"
		)
	);
}
