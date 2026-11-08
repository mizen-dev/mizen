// @vitest-environment happy-dom
import { act, useCallback, useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FileUpload,
	FileUploadInput,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import { attachFormResetListener } from "../../../packages/ui/src/components/file-upload/file-upload-context";
import {
	createMockFile,
	getSlot,
	mount,
	triggerSelect,
} from "./file-upload-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_v: T, o: object): object => o,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
describe("FileUpload dynamic form attribute reset ownership", () => {
	it("rebinds reset listener when input form attribute moves from form A to form B", async () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("changed.txt", 200, "text/plain");
		const { container, unmount } = mount(<DynamicFormReassociation f1={f1} />);
		const formA = getSlot<HTMLFormElement>(container, "form-a");
		const formB = getSlot<HTMLFormElement>(container, "form-b");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const switchBtn = getSlot<HTMLButtonElement>(container, "switch-btn");
		triggerSelect(container, [f2]);
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		await act(async () => {
			switchBtn?.click();
			await Promise.resolve();
		});
		act(() => {
			formA?.dispatchEvent(
				new Event("reset", {
					bubbles: true,
					cancelable: true,
				})
			);
		});
		await act(async () => {
			await Promise.resolve();
		});
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		act(() => {
			formB?.dispatchEvent(
				new Event("reset", {
					bubbles: true,
					cancelable: true,
				})
			);
		});
		await act(async () => {
			await Promise.resolve();
		});
		expect(Array.from(input?.files ?? [])).toEqual([f1]);
		unmount();
	});
	it("binds reset listener when input transitions from no form to external form", async () => {
		const f1 = createMockFile("default.txt", 100, "text/plain");
		const f2 = createMockFile("selected.txt", 200, "text/plain");
		const { container, unmount } = mount(<InitialNoFormAssociation f1={f1} />);
		const externalForm = getSlot<HTMLFormElement>(container, "external-form");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const associateBtn = getSlot<HTMLButtonElement>(container, "associate-btn");
		triggerSelect(container, [f2]);
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		act(() => {
			externalForm?.dispatchEvent(
				new Event("reset", {
					bubbles: true,
					cancelable: true,
				})
			);
		});
		await act(async () => {
			await Promise.resolve();
		});
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		await act(async () => {
			associateBtn?.click();
			await Promise.resolve();
		});
		act(() => {
			externalForm?.dispatchEvent(
				new Event("reset", {
					bubbles: true,
					cancelable: true,
				})
			);
		});
		await act(async () => {
			await Promise.resolve();
		});
		expect(Array.from(input?.files ?? [])).toEqual([f1]);
		unmount();
	});
	it("disconnects observer and detaches listeners on unmount", async () => {
		const form = document.createElement("form");
		form.id = "clean-form";
		document.body.appendChild(form);
		const input = document.createElement("input");
		input.setAttribute("form", "clean-form");
		document.body.appendChild(input);
		const onReset = vi.fn();
		const cleanup = attachFormResetListener(input, onReset);
		form.dispatchEvent(
			new Event("reset", {
				cancelable: true,
			})
		);
		cleanup?.();
		await Promise.resolve();
		expect(onReset).not.toHaveBeenCalled();
		form.dispatchEvent(
			new Event("reset", {
				cancelable: true,
			})
		);
		await Promise.resolve();
		expect(onReset).not.toHaveBeenCalled();
		form.remove();
		input.remove();
	});
	it("cancels queued reset microtask if form owner changes before microtask drains", async () => {
		const formA = document.createElement("form");
		formA.id = "former-form-a";
		const formB = document.createElement("form");
		formB.id = "former-form-b";
		document.body.appendChild(formA);
		document.body.appendChild(formB);
		const input = document.createElement("input");
		input.setAttribute("form", "former-form-a");
		document.body.appendChild(input);
		const onReset = vi.fn();
		const cleanup = attachFormResetListener(input, onReset);
		formA.dispatchEvent(
			new Event("reset", {
				cancelable: true,
			})
		);
		input.setAttribute("form", "former-form-b");
		await Promise.resolve();
		expect(onReset).not.toHaveBeenCalled();
		cleanup?.();
		formA.remove();
		formB.remove();
		input.remove();
	});
});
function DynamicFormReassociation({ f1 }: { f1: File }) {
	const [formOwner, setFormOwner] = useState("form-a");
	const handleSwitch = useCallback(() => setFormOwner("form-b"), []);
	return (
		<div>
			<form data-slot="form-a" id="form-a" />
			<form data-slot="form-b" id="form-b" />
			<button data-slot="switch-btn" onClick={handleSwitch} type="button">
				Switch
			</button>
			<FileUpload defaultValue={[f1]} name="files">
				<FileUploadInput form={formOwner} />
			</FileUpload>
		</div>
	);
}
function InitialNoFormAssociation({ f1 }: { f1: File }) {
	const [formOwner, setFormOwner] = useState<string | undefined>(undefined);
	const handleAssociate = useCallback(() => setFormOwner("external-form"), []);
	return (
		<div>
			<form data-slot="external-form" id="external-form" />
			<button data-slot="associate-btn" onClick={handleAssociate} type="button">
				Associate
			</button>
			<FileUpload defaultValue={[f1]} name="files">
				<FileUploadInput form={formOwner} />
			</FileUpload>
		</div>
	);
}
