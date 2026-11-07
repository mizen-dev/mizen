// @vitest-environment happy-dom
import type { DragEvent as ReactDragEvent } from "react";
import { act, Suspense, startTransition, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	FileUpload,
	FileUploadDropzone,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	createMockDataTransfer,
	createMockFile,
	dispatchDragEnter,
	dispatchDragLeave,
	getSlot,
	mount,
	triggerDrop,
} from "./file-upload-test-helpers";

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

const createDragEvent = (type: string) =>
	new Event(type, { bubbles: true, cancelable: true });

const createMockDragHandlers = () => ({
	onDragEnter: vi.fn(),
	onDragLeave: vi.fn(),
	onDragOver: vi.fn(),
	onDrop: vi.fn(),
});

describe("FileUploadDropzone interactions and drag-drop behavior", () => {
	it("tracks nested drag depth on dropzone and ignores drops when disabled", () => {
		const onValueChange = vi.fn();
		const file = createMockFile("test.txt", 100, "text/plain");

		const { container, unmount } = mount(
			<FileUpload onValueChange={onValueChange}>
				<FileUploadDropzone>
					<span data-slot="child-text">Drop here</span>
				</FileUploadDropzone>
			</FileUpload>
		);

		const dropzone = getSlot(container, "file-upload-dropzone");
		const child = getSlot(container, "child-text");

		expect(dropzone).not.toBeNull();
		expect(child).not.toBeNull();
		act(() => {
			dispatchDragEnter(dropzone as HTMLElement);
			dispatchDragEnter(child as HTMLElement);
			dispatchDragLeave(child as HTMLElement);
		});
		expect(dropzone?.getAttribute("data-dragging")).toBe("");
		act(() => dispatchDragLeave(dropzone as HTMLElement));
		expect(dropzone?.getAttribute("data-dragging")).toBeNull();
		unmount();

		const disabled = mount(
			<FileUpload disabled onValueChange={onValueChange}>
				<FileUploadDropzone />
			</FileUpload>
		);
		triggerDrop(disabled.container, [file]);
		expect(onValueChange).not.toHaveBeenCalled();
		disabled.unmount();
	});

	it("does not invoke consumer drag callbacks, does not process files, and prevents navigation when dropzone is disabled", () => {
		const handlers = createMockDragHandlers();
		const onValueChange = vi.fn();
		const file = createMockFile("test.txt", 100, "text/plain");

		const { container, unmount } = mount(
			<FileUpload onValueChange={onValueChange}>
				<FileUploadDropzone disabled {...handlers} />
			</FileUpload>
		);

		const dropzone = getSlot(container, "file-upload-dropzone");
		expect(dropzone).not.toBeNull();

		// DragEnter
		act(() => dropzone?.dispatchEvent(createDragEvent("dragenter")));
		expect(handlers.onDragEnter).not.toHaveBeenCalled();
		expect(dropzone?.getAttribute("data-dragging")).toBeNull();

		// DragOver: suppresses browser navigation via preventDefault without invoking consumer callback
		const overEvent = createDragEvent("dragover");
		act(() => dropzone?.dispatchEvent(overEvent));
		expect(handlers.onDragOver).not.toHaveBeenCalled();
		expect(overEvent.defaultPrevented).toBe(true);

		// DragLeave
		act(() => dropzone?.dispatchEvent(createDragEvent("dragleave")));
		expect(handlers.onDragLeave).not.toHaveBeenCalled();

		// Drop: suppresses browser navigation via preventDefault without invoking consumer callback or processing files
		const dropEvent = createDragEvent("drop");
		const dataTransfer = createMockDataTransfer([file]);
		Object.defineProperty(dropEvent, "dataTransfer", { value: dataTransfer });
		act(() => dropzone?.dispatchEvent(dropEvent));
		expect(handlers.onDrop).not.toHaveBeenCalled();
		expect(onValueChange).not.toHaveBeenCalled();
		expect(dropEvent.defaultPrevented).toBe(true);

		unmount();
	});

	it("does not invoke consumer drag callbacks, does not process files, and prevents navigation when root is disabled", () => {
		const handlers = createMockDragHandlers();
		const onValueChange = vi.fn();
		const file = createMockFile("test.txt", 100, "text/plain");

		const { container, unmount } = mount(
			<FileUpload disabled onValueChange={onValueChange}>
				<FileUploadDropzone {...handlers} />
			</FileUpload>
		);

		const dropzone = getSlot(container, "file-upload-dropzone");
		expect(dropzone).not.toBeNull();

		const overEvent = createDragEvent("dragover");
		act(() => dropzone?.dispatchEvent(overEvent));
		expect(handlers.onDragOver).not.toHaveBeenCalled();
		expect(overEvent.defaultPrevented).toBe(true);

		const dropEvent = createDragEvent("drop");
		const dataTransfer = createMockDataTransfer([file]);
		Object.defineProperty(dropEvent, "dataTransfer", { value: dataTransfer });
		act(() => dropzone?.dispatchEvent(dropEvent));
		expect(handlers.onDrop).not.toHaveBeenCalled();
		expect(onValueChange).not.toHaveBeenCalled();
		expect(dropEvent.defaultPrevented).toBe(true);

		unmount();
	});

	it("clears drag depth and data-dragging on leave even when consumer calls preventDefault", () => {
		const onDragLeave = vi.fn((e: ReactDragEvent<HTMLDivElement>) =>
			e.preventDefault()
		);
		const { container, unmount } = mount(
			<FileUpload>
				<FileUploadDropzone onDragLeave={onDragLeave} />
			</FileUpload>
		);

		const dropzone = getSlot(container, "file-upload-dropzone");
		expect(dropzone).not.toBeNull();

		act(() => dispatchDragEnter(dropzone as HTMLElement));
		expect(dropzone?.getAttribute("data-dragging")).toBe("");

		act(() => dropzone?.dispatchEvent(createDragEvent("dragleave")));
		expect(onDragLeave).toHaveBeenCalledTimes(1);
		expect(dropzone?.getAttribute("data-dragging")).toBeNull();

		unmount();
	});

	it("clears drag depth and data-dragging on drop even when consumer calls preventDefault", () => {
		const onDrop = vi.fn((e: ReactDragEvent<HTMLDivElement>) =>
			e.preventDefault()
		);
		const onValueChange = vi.fn();
		const file = createMockFile("test.txt", 100, "text/plain");

		const { container, unmount } = mount(
			<FileUpload onValueChange={onValueChange}>
				<FileUploadDropzone onDrop={onDrop} />
			</FileUpload>
		);

		const dropzone = getSlot(container, "file-upload-dropzone");
		expect(dropzone).not.toBeNull();

		act(() => dispatchDragEnter(dropzone as HTMLElement));
		expect(dropzone?.getAttribute("data-dragging")).toBe("");

		const dropEvent = createDragEvent("drop");
		const dataTransfer = createMockDataTransfer([file]);
		Object.defineProperty(dropEvent, "dataTransfer", { value: dataTransfer });
		act(() => dropzone?.dispatchEvent(dropEvent));
		expect(onDrop).toHaveBeenCalledTimes(1);
		expect(onValueChange).not.toHaveBeenCalled();
		expect(dropzone?.getAttribute("data-dragging")).toBeNull();

		unmount();
	});

	it("clears data-dragging when transitioning to disabled during active drag without effects", () => {
		let setDisabledState: (d: boolean) => void = () => undefined;
		function StateHarness() {
			const [disabled, setDisabled] = useState(false);
			setDisabledState = setDisabled;
			return (
				<FileUpload>
					<FileUploadDropzone disabled={disabled} />
				</FileUpload>
			);
		}
		const { container, unmount } = mount(<StateHarness />);
		const dropzone = getSlot(container, "file-upload-dropzone");
		expect(dropzone).not.toBeNull();
		act(() => dispatchDragEnter(dropzone as HTMLElement));
		expect(dropzone?.getAttribute("data-dragging")).toBe("");

		act(() => setDisabledState(true));
		expect(dropzone?.getAttribute("data-dragging")).toBeNull();

		const errorSpy = vi.spyOn(console, "error");
		unmount();
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it("preserves committed drag depth when an uncommitted disabled transition suspends", async () => {
		let resolveSuspend: (() => void) | undefined;
		let setTransition: (d: boolean) => void = () => undefined;
		let forceRerender: () => void = () => undefined;

		function Suspendable({ shouldSuspend }: { shouldSuspend: boolean }) {
			if (shouldSuspend) {
				throw new Promise<void>((r) => {
					resolveSuspend = r;
				});
			}
			return null;
		}

		function ConcurrentHarness() {
			const [disabled, setDisabled] = useState(false);
			const [, setRev] = useState(0);
			forceRerender = () => setRev((r) => r + 1);
			setTransition = (d) => {
				const update = () => {
					setDisabled(d);
					setRev((r) => r + 1);
				};
				if (d) {
					startTransition(update);
				} else {
					update();
				}
			};

			return (
				<Suspense fallback={null}>
					<FileUpload>
						<FileUploadDropzone disabled={disabled}>
							<span data-slot="child-text">Child</span>
							<Suspendable shouldSuspend={disabled} />
						</FileUploadDropzone>
					</FileUpload>
				</Suspense>
			);
		}

		const { container, unmount } = mount(<ConcurrentHarness />);
		const dropzone = getSlot(container, "file-upload-dropzone");
		const child = getSlot(container, "child-text");

		act(() => {
			dropzone?.dispatchEvent(createDragEvent("dragenter"));
			child?.dispatchEvent(createDragEvent("dragenter"));
		});
		expect(dropzone?.getAttribute("data-dragging")).toBe("");

		act(() => setTransition(true));
		expect(dropzone?.getAttribute("data-disabled")).toBeNull();

		expect(resolveSuspend).toBeDefined();
		if (!resolveSuspend) {
			throw new Error("Expected suspension to provide a resolver");
		}
		const resolver = resolveSuspend;

		await act(async () => {
			resolver();
			setTransition(false);
			await Promise.resolve();
		});
		expect(dropzone?.getAttribute("data-disabled")).toBeNull();

		act(() => {
			dropzone?.dispatchEvent(createDragEvent("dragleave"));
		});
		act(() => forceRerender());
		expect(dropzone?.getAttribute("data-dragging")).toBe("");

		unmount();
	});
});
