// @vitest-environment happy-dom
import { act } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemRemove,
	FileUploadList,
	FileUploadTrigger,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	attachFormResetListener,
	syncInputFiles,
} from "../../../packages/ui/src/components/file-upload/file-upload-context";
import { createMockFile, getSlot, mount } from "./file-upload-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_v: T, o: object): object => o,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("FileUpload lifecycle and ref correctness", () => {
	it("executes root, trigger, and input callback-ref cleanup exactly once on unmount", () => {
		const rootCleanup = vi.fn();
		const triggerCleanup = vi.fn();
		const inputCleanup = vi.fn();

		const rootRef = vi.fn((_node: HTMLDivElement | null) => rootCleanup);
		const triggerRef = vi.fn(
			(_node: HTMLButtonElement | null) => triggerCleanup
		);
		const inputRef = vi.fn((_node: HTMLInputElement | null) => inputCleanup);

		const { unmount } = mount(
			<FileUpload ref={rootRef}>
				<FileUploadDropzone>
					<FileUploadTrigger ref={triggerRef}>Select</FileUploadTrigger>
				</FileUploadDropzone>
				<FileUploadInput ref={inputRef} />
			</FileUpload>
		);

		expect(rootRef).toHaveBeenCalledTimes(1);
		expect(triggerRef).toHaveBeenCalledTimes(1);
		expect(inputRef).toHaveBeenCalledTimes(1);

		expect(rootCleanup).not.toHaveBeenCalled();
		expect(triggerCleanup).not.toHaveBeenCalled();
		expect(inputCleanup).not.toHaveBeenCalled();

		unmount();

		expect(rootCleanup).toHaveBeenCalledTimes(1);
		expect(triggerCleanup).toHaveBeenCalledTimes(1);
		expect(inputCleanup).toHaveBeenCalledTimes(1);
	});

	it("clears internal and object refs on unmount", () => {
		const rootRefObj = { current: null as HTMLDivElement | null };
		const triggerRefObj = { current: null as HTMLButtonElement | null };
		const inputRefObj = { current: null as HTMLInputElement | null };

		const { unmount } = mount(
			<FileUpload ref={rootRefObj}>
				<FileUploadDropzone>
					<FileUploadTrigger ref={triggerRefObj}>Select</FileUploadTrigger>
				</FileUploadDropzone>
				<FileUploadInput ref={inputRefObj} />
			</FileUpload>
		);

		expect(rootRefObj.current).not.toBeNull();
		expect(triggerRefObj.current).not.toBeNull();
		expect(inputRefObj.current).not.toBeNull();

		unmount();

		expect(rootRefObj.current).toBeNull();
		expect(triggerRefObj.current).toBeNull();
		expect(inputRefObj.current).toBeNull();
	});

	it("fires onBlur only when focus leaves the compound root", () => {
		const onBlur = vi.fn();
		const file = createMockFile("test.txt", 100, "text/plain");

		const { container, unmount } = mount(
			<div>
				<FileUpload defaultValue={[file]} onBlur={onBlur}>
					<FileUploadDropzone>
						<FileUploadTrigger>Select</FileUploadTrigger>
					</FileUploadDropzone>
					<FileUploadInput />
					<FileUploadList>
						<FileUploadItem file={file} index={0}>
							<FileUploadItemName>{file.name}</FileUploadItemName>
							<FileUploadItemRemove />
						</FileUploadItem>
					</FileUploadList>
				</FileUpload>
				<button data-slot="external-button" type="button">
					External
				</button>
			</div>
		);

		const root = getSlot(container, "file-upload");
		const trigger = getSlot(container, "file-upload-trigger");
		const removeBtn = getSlot(container, "file-upload-item-remove");
		const externalBtn = getSlot(container, "external-button");

		expect(root).not.toBeNull();
		expect(trigger).not.toBeNull();
		expect(removeBtn).not.toBeNull();
		expect(externalBtn).not.toBeNull();

		act(() => {
			trigger?.focus();
			removeBtn?.focus();
		});

		expect(onBlur).not.toHaveBeenCalled();

		act(() => {
			externalBtn?.focus();
		});

		expect(onBlur).toHaveBeenCalledTimes(1);

		act(() => {
			trigger?.focus();
			trigger?.blur();
		});

		expect(onBlur).toHaveBeenCalledTimes(2);

		unmount();
	});

	it("invalidates queued reset microtask if cleanup runs before microtask drains on reset-then-unmount", async () => {
		const form = document.createElement("form");
		const input = document.createElement("input");
		form.appendChild(input);
		const onReset = vi.fn();
		const cleanup = attachFormResetListener(input, onReset);

		form.dispatchEvent(new Event("reset"));
		cleanup?.();

		await Promise.resolve();
		expect(onReset).not.toHaveBeenCalled();
	});

	it("invalidates queued reset microtask on ref-replacement timing", async () => {
		const form = document.createElement("form");
		const input1 = document.createElement("input");
		const input2 = document.createElement("input");
		form.appendChild(input1);
		form.appendChild(input2);

		const onReset1 = vi.fn();
		const onReset2 = vi.fn();

		const cleanup1 = attachFormResetListener(input1, onReset1);
		form.dispatchEvent(new Event("reset"));
		cleanup1?.();

		const cleanup2 = attachFormResetListener(input2, onReset2);

		await Promise.resolve();
		expect(onReset1).not.toHaveBeenCalled();
		expect(onReset2).not.toHaveBeenCalled();
		cleanup2?.();
	});

	it("clears empty files by setting input.value even when DataTransfer is unavailable", () => {
		const originalDataTransfer = Reflect.get(globalThis, "DataTransfer");
		try {
			Reflect.deleteProperty(globalThis, "DataTransfer");
			const input = document.createElement("input");
			input.value = "test-path";
			syncInputFiles(input, []);
			expect(input.value).toBe("");

			const file = createMockFile("a.txt", 10, "text/plain");
			syncInputFiles(input, [file]);
			expect(input.value).toBe("");
		} finally {
			Reflect.set(globalThis, "DataTransfer", originalDataTransfer);
		}
	});
});
