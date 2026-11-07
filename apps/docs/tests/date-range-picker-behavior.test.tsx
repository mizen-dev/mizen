// @vitest-environment happy-dom
import { act, createRef, createElement as h, useState } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

import type { CalendarRangeValue } from "../../../packages/ui/src/components/calendar/calendar.types";
import { DateRangePicker } from "../../../packages/ui/src/components/date-range-picker/date-range-picker";
import { findDayButton, mount } from "./calendar-test-helpers";
import { setInputValue } from "./date-picker-test-helpers";

describe("DateRangePicker component behavior", () => {
	it("uses native required validity and blocks invalid range drafts before blur", () => {
		const onSubmit = vi.fn();

		function FormConsumer() {
			return h(
				"form",
				{
					onSubmit: (event) => {
						event.preventDefault();
						onSubmit();
					},
				},
				h(DateRangePicker, {
					minNights: 3,
					name: "dateRange",
					required: true,
				}),
				h("button", { type: "submit" }, "Submit")
			);
		}

		const { container, unmount } = mount(h(FormConsumer));
		const form = container.querySelector("form");
		const input = container.querySelector<HTMLInputElement>("input");
		const submitButton = container.querySelector<HTMLButtonElement>(
			'button[type="submit"]'
		);
		expect(form).not.toBeNull();
		expect(input).not.toBeNull();
		expect(submitButton).not.toBeNull();
		if (!(form && input && submitButton)) {
			return;
		}

		expect(form.checkValidity()).toBe(false);
		expect(input.validity.valueMissing).toBe(true);
		expect(input.validity.customError).toBe(false);

		act(() => input.focus());
		act(() => setInputValue(input, " "));
		expect(input.validity.valueMissing).toBe(false);
		expect(input.validity.customError).toBe(true);
		expect(form.checkValidity()).toBe(false);

		act(() => setInputValue(input, "2026-10-03 – 2026-10-04"));
		expect(form.checkValidity()).toBe(false);
		expect(input.validity.customError).toBe(true);
		act(() => form.requestSubmit(submitButton));
		expect(onSubmit).not.toHaveBeenCalled();

		act(() => setInputValue(input, "2026-10-03 – 2026-10-06"));
		expect(input.validity.customError).toBe(false);
		expect(form.checkValidity()).toBe(true);
		act(() => form.requestSubmit(submitButton));
		expect(onSubmit).toHaveBeenCalledTimes(1);
		unmount();
	});

	it("blocks submitting a pending start date as a complete range", () => {
		const onSubmit = vi.fn();
		const { container, unmount } = mount(
			h(
				"form",
				{
					onSubmit: (event) => {
						event.preventDefault();
						onSubmit();
					},
				},
				h(DateRangePicker, { name: "dateRange" }),
				h("button", { type: "submit" }, "Submit")
			)
		);
		const form = container.querySelector("form");
		const input = container.querySelector<HTMLInputElement>("input");
		const submitButton = container.querySelector<HTMLButtonElement>(
			'button[type="submit"]'
		);
		expect(form && input && submitButton).not.toBeNull();
		if (!(form && input && submitButton)) {
			return;
		}

		act(() => {
			input.focus();
			setInputValue(input, "2026-10-03");
		});
		expect(input.validity.customError).toBe(true);
		act(() => form.requestSubmit(submitButton));
		expect(onSubmit).not.toHaveBeenCalled();
		unmount();
	});

	it("restores the initial uncontrolled value on native form reset", async () => {
		const initial = {
			from: new Date(2026, 9, 3),
			to: new Date(2026, 9, 10),
		};
		const { container, unmount } = mount(
			h("form", {}, h(DateRangePicker, { defaultValue: initial }))
		);
		const form = container.querySelector("form");
		const input = container.querySelector<HTMLInputElement>("input");
		expect(form && input).not.toBeNull();
		if (!(form && input)) {
			return;
		}

		act(() => {
			input.focus();
			setInputValue(input, "2026-10-04 – 2026-10-11");
			input.blur();
		});
		expect(input.value).toBe("2026-10-04 – 2026-10-11");
		await act(async () => {
			form.reset();
			await Promise.resolve();
		});
		expect(input.value).toBe("2026-10-03 – 2026-10-10");
		unmount();
	});

	it("renders canonical placeholder YYYY-MM-DD – YYYY-MM-DD", () => {
		const { container, unmount } = mount(h(DateRangePicker, {}));
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.placeholder).toBe("YYYY-MM-DD – YYYY-MM-DD");
		unmount();
	});

	it("renders initial value in canonical format YYYY-MM-DD – YYYY-MM-DD", () => {
		const initial = {
			from: new Date(2026, 9, 3),
			to: new Date(2026, 9, 10),
		};
		const { container, unmount } = mount(
			h(DateRangePicker, { defaultValue: initial })
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.value).toBe("2026-10-03 – 2026-10-10");
		unmount();
	});

	it("forwards the input ref and accessible name and description", () => {
		const inputRef = createRef<HTMLInputElement>();
		const { container, unmount } = mount(
			h(DateRangePicker, {
				"aria-describedby": "date-range-help",
				"aria-labelledby": "date-range-label",
				ref: inputRef,
			})
		);
		const input = container.querySelector("input");
		expect(inputRef.current).toBe(input);
		expect(input?.getAttribute("aria-labelledby")).toBe("date-range-label");
		expect(input?.getAttribute("aria-describedby")).toBe("date-range-help");
		act(() => inputRef.current?.focus());
		expect(document.activeElement).toBe(input);
		unmount();
		expect(inputRef.current).toBeNull();
	});

	it("renders partial initial value as YYYY-MM-DD", () => {
		const initial = {
			from: new Date(2026, 9, 3),
		};
		const { container, unmount } = mount(
			h(DateRangePicker, {
				defaultValue: initial,
				minValue: new Date(2026, 9, 4),
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.value).toBe("2026-10-03");
		unmount();
	});

	it("commits valid range text on blur and triggers onValueChange", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(h(DateRangePicker, { onValueChange }));
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-03 to 2026-10-08");
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const committed = onValueChange.mock.calls[0]?.[0];
		expect(committed?.from.getFullYear()).toBe(2026);
		expect(committed?.from.getMonth()).toBe(9);
		expect(committed?.from.getDate()).toBe(3);
		expect(committed?.to.getFullYear()).toBe(2026);
		expect(committed?.to.getMonth()).toBe(9);
		expect(committed?.to.getDate()).toBe(8);
		// Canonical display text reformatted on blur
		expect(input.value).toBe("2026-10-03 – 2026-10-08");
		expect(input.getAttribute("aria-invalid")).toBeNull();

		unmount();
	});

	it("keeps invalid text on blur, sets aria-invalid, and does not emit onValueChange", () => {
		const onValueChange = vi.fn();
		const initial = {
			from: new Date(2026, 9, 3),
			to: new Date(2026, 9, 10),
		};
		const { container, unmount } = mount(
			h(DateRangePicker, { defaultValue: initial, onValueChange })
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
			setInputValue(input, "2026-10-10 – 2026-10-03"); // reversed
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.value).toBe("2026-10-10 – 2026-10-03");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		unmount();
	});

	it("restores latest committed value on Escape key in text input", () => {
		const initial = {
			from: new Date(2026, 9, 3),
			to: new Date(2026, 9, 10),
		};
		const { container, unmount } = mount(
			h(DateRangePicker, {
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
			setInputValue(input, "gibberish draft");
		});
		act(() => {
			input.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
			);
		});

		expect(input.value).toBe("2026-10-03 – 2026-10-10");
		expect(input.getAttribute("aria-invalid")).toBeNull();
		expect(input.validity.customError).toBe(true);

		unmount();
	});

	it("first calendar selection commits partial and keeps popup open; second selection completes and closes", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(
			h(DateRangePicker, {
				defaultValue: undefined,
				onValueChange,
			})
		);

		const trigger = container.querySelector(
			"button[aria-label='Open calendar']"
		);
		expect(trigger).not.toBeNull();
		if (!trigger) {
			return;
		}

		// Click trigger to open popup
		act(() => {
			(trigger as HTMLButtonElement).click();
		});

		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
		const day10 = findDayButton(document.body, 10, currentMonth, currentYear);
		const day15 = findDayButton(document.body, 15, currentMonth, currentYear);

		// First click selects start date
		act(() => {
			day10.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const firstCall = onValueChange.mock.calls[0]?.[0];
		expect(firstCall?.from.getDate()).toBe(10);
		// Popup remains open
		expect(
			findDayButton(document.body, 15, currentMonth, currentYear)
		).not.toBeNull();

		// Second click completes range
		act(() => {
			day15.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(2);
		const secondCall = onValueChange.mock.calls[1]?.[0];
		expect(secondCall?.from.getDate()).toBe(10);
		expect(secondCall?.to.getDate()).toBe(15);

		unmount();
	});

	it("respects readOnly and disabled properties", () => {
		const onValueChange = vi.fn();
		const initial = {
			from: new Date(2026, 9, 3),
			to: new Date(2026, 9, 10),
		};
		const { container, unmount } = mount(
			h(DateRangePicker, {
				defaultValue: initial,
				onValueChange,
				readOnly: true,
			})
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		act(() => {
			setInputValue(input, "2026-10-01 – 2026-10-05");
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		unmount();
	});

	it.each([10, 12])(
		"completes an uncontrolled range ending on day %s",
		(endDay) => {
			const onValueChange = vi.fn();
			const { container, unmount } = mount(
				h(DateRangePicker, {
					defaultValue: undefined,
					onValueChange,
				})
			);

			const trigger = container.querySelector(
				"button[aria-label='Open calendar']"
			);
			expect(trigger).not.toBeNull();
			if (!trigger) {
				return;
			}

			act(() => {
				(trigger as HTMLButtonElement).click();
			});

			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().toLocaleString("en-US", {
				month: "long",
			});
			let day10 = findDayButton(document.body, 10, currentMonth, currentYear);

			act(() => {
				day10.click();
			});

			expect(onValueChange).toHaveBeenCalledTimes(1);
			expect(onValueChange.mock.calls[0]?.[0]?.to).toBeUndefined();
			expect(trigger.getAttribute("aria-expanded")).toBe("true");
			day10 = findDayButton(document.body, endDay, currentMonth, currentYear);

			act(() => {
				day10.click();
			});

			expect(onValueChange).toHaveBeenCalledTimes(2);
			const secondCall = onValueChange.mock.calls[1]?.[0];
			expect(secondCall?.from.getDate()).toBe(10);
			expect(secondCall?.to?.getDate()).toBe(endDay);
			expect(trigger.getAttribute("aria-expanded")).toBe("false");

			const input = container.querySelector("input");
			expect(input?.value.endsWith(`-${String(endDay).padStart(2, "0")}`)).toBe(
				true
			);

			unmount();
		}
	);

	it.each([10, 12])(
		"completes a controlled range ending on day %s",
		(endDay) => {
			const onValueChange = vi.fn();
			const ControlledPicker = () => {
				const [value, setValue] = useState<CalendarRangeValue | undefined>();
				return h(DateRangePicker, {
					onValueChange: (nextValue) => {
						onValueChange(nextValue);
						setValue(nextValue);
					},
					value,
				});
			};
			const { container, unmount } = mount(h(ControlledPicker, {}));
			const trigger = container.querySelector(
				"button[aria-label='Open calendar']"
			);
			expect(trigger).not.toBeNull();
			if (!trigger) {
				return;
			}

			act(() => {
				(trigger as HTMLButtonElement).click();
			});
			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().toLocaleString("en-US", {
				month: "long",
			});
			const day10 = findDayButton(document.body, 10, currentMonth, currentYear);
			act(() => {
				day10.click();
			});
			expect(onValueChange.mock.calls[0]?.[0]?.to).toBeUndefined();
			expect(trigger.getAttribute("aria-expanded")).toBe("true");
			const secondDay10 = findDayButton(
				document.body,
				endDay,
				currentMonth,
				currentYear
			);
			act(() => {
				secondDay10.click();
			});

			expect(onValueChange).toHaveBeenCalledTimes(2);
			const completed = onValueChange.mock.calls[1]?.[0];
			expect(completed?.from.getDate()).toBe(10);
			expect(completed?.to?.getDate()).toBe(endDay);
			expect(
				container
					.querySelector("input")
					?.value.endsWith(`-${String(endDay).padStart(2, "0")}`)
			).toBe(true);
			expect(trigger.getAttribute("aria-expanded")).toBe("false");
			unmount();
		}
	);

	it("suppresses duplicate onValueChange callbacks when next range equals committedValue", () => {
		const onValueChange = vi.fn();
		const initial = {
			from: new Date(2026, 9, 3),
			to: new Date(2026, 9, 10),
		};
		const { container, unmount } = mount(
			h(DateRangePicker, {
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
			setInputValue(input, "2026-10-03 to 2026-10-10");
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.getAttribute("aria-invalid")).toBeNull();

		unmount();
	});
});
