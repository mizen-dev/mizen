// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act, useCallback } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { Input } from "../../../packages/ui/src/components/input/input";
import {
	focusFirstInvalidControl,
	useForm,
} from "../../../packages/ui/src/form";
import { mount, renderBoundField } from "./form-test-helpers";

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
describe("TanStack Form submission and focus behavior", () => {
	it("handles valid form submission", async () => {
		let formInstance: SubmissionFormApi | undefined;
		const handleSubmit = vi.fn();
		const onFormInstance: ComponentProps<
			typeof SubmissionForm
		>["onFormInstance"] = (value) => {
			formInstance = value;
		};
		const { container, unmount } = mount(
			<SubmissionForm
				handleSubmit={handleSubmit}
				onFormInstance={onFormInstance}
			/>
		);
		const formEl = container.querySelector("form");
		expect(formEl).not.toBeNull();
		await act(async () => {
			await formInstance?.handleSubmit();
		});
		expect(handleSubmit).toHaveBeenCalledWith({
			nickname: "sam",
		});
		unmount();
	});
	it("subscribes to async isSubmitting state", async () => {
		let isSubmittingRecorded = false;
		let resolveSubmission: () => void = () => undefined;
		const onResolveSubmission: ComponentProps<
			typeof AsyncSubmissionForm
		>["onResolveSubmission"] = (value) => {
			resolveSubmission = value;
		};
		const onIsSubmittingRecorded: ComponentProps<
			typeof AsyncSubmissionForm
		>["onIsSubmittingRecorded"] = (value) => {
			isSubmittingRecorded = value;
		};
		const { container, unmount } = mount(
			<AsyncSubmissionForm
				onIsSubmittingRecorded={onIsSubmittingRecorded}
				onResolveSubmission={onResolveSubmission}
			/>
		);
		const formEl = container.querySelector("form");
		expect(formEl).not.toBeNull();
		await act(async () => {
			formEl?.dispatchEvent(
				new Event("submit", {
					bubbles: true,
					cancelable: true,
				})
			);
			await Promise.resolve();
		});
		expect(isSubmittingRecorded).toBe(true);
		await act(async () => {
			resolveSubmission();
			await Promise.resolve();
		});
		expect(container.textContent).toContain("Idle");
		unmount();
	});
	it("focuses the first enabled invalid control using focusFirstInvalidControl", () => {
		const container = document.body.appendChild(document.createElement("div"));
		container.innerHTML = `
			<form id="test-form">
				<input id="valid" aria-invalid="false" />
				<input id="disabled-invalid" aria-invalid="true" disabled />
				<fieldset disabled>
					<input id="fieldset-disabled-invalid" aria-invalid="true" />
				</fieldset>
				<input id="target-invalid" aria-invalid="true" />
				<input id="second-invalid" aria-invalid="true" />
			</form>
		`;
		const form = container.querySelector<HTMLFormElement>("#test-form");
		const target = container.querySelector<HTMLInputElement>("#target-invalid");
		const result = focusFirstInvalidControl(form);
		expect(result).toBe(true);
		expect(document.activeElement).toBe(target);
		target?.removeAttribute("aria-invalid");
		container.querySelector("#second-invalid")?.removeAttribute("aria-invalid");
		const secondResult = focusFirstInvalidControl(form);
		expect(secondResult).toBe(false);
		container.remove();
	});
	it("skips unfocusable aria-invalid elements and focuses the first focusable invalid control", () => {
		const container = document.body.appendChild(document.createElement("div"));
		container.innerHTML = `
			<form id="test-form">
				<div id="unfocusable-invalid" aria-invalid="true">Error text</div>
				<input id="target-invalid" aria-invalid="true" />
			</form>
		`;
		const form = container.querySelector<HTMLFormElement>("#test-form");
		const target = container.querySelector<HTMLInputElement>("#target-invalid");
		const unfocusable = container.querySelector<HTMLDivElement>(
			"#unfocusable-invalid"
		);
		if (unfocusable) {
			unfocusable.focus = vi.fn();
		}
		const result = focusFirstInvalidControl(form);
		expect(result).toBe(true);
		expect(document.activeElement).toBe(target);
		target?.removeAttribute("aria-invalid");
		const secondResult = focusFirstInvalidControl(form);
		expect(secondResult).toBe(false);
		container.remove();
	});
});
type SubmissionFormApi = ReturnType<typeof useTestForm>;
function useTestForm(onSubmit: (val: { nickname: string }) => void) {
	return useForm({
		defaultValues: {
			nickname: "sam",
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});
}
function SubmissionForm({
	handleSubmit,
	onFormInstance,
}: {
	handleSubmit: (value: { nickname: string }) => void;
	onFormInstance: (value: SubmissionFormApi | undefined) => void;
}) {
	const form = useTestForm(handleSubmit);
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
			<form.Field name="nickname">
				{(field) => renderBoundField(field, <Input />)}
			</form.Field>
			<button type="submit">Save</button>
		</form>
	);
}
function AsyncSubmissionForm({
	onResolveSubmission,
	onIsSubmittingRecorded,
}: {
	onResolveSubmission: (value: () => void) => void;
	onIsSubmittingRecorded: (value: boolean) => void;
}) {
	const form = useForm({
		defaultValues: {
			query: "search",
		},
		onSubmit: async () => {
			await new Promise<void>((resolve) => {
				onResolveSubmission(resolve);
			});
		},
	});
	const onSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			e.stopPropagation();
			form.handleSubmit();
		},
		[form]
	);
	const selectIsSubmitting = useCallback(
		(state: { isSubmitting: boolean }) => state.isSubmitting,
		[]
	);
	return (
		<form onSubmit={onSubmit}>
			<form.Subscribe selector={selectIsSubmitting}>
				{(isSubmitting) => {
					if (isSubmitting) {
						onIsSubmittingRecorded(true);
					}
					return <span>{isSubmitting ? "Submitting..." : "Idle"}</span>;
				}}
			</form.Subscribe>
			<button type="submit">Go</button>
		</form>
	);
}
