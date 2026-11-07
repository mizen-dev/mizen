import { act } from "react";
import { createRoot } from "react-dom/client";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

export function createMockFile(name: string, size: number, type: string): File {
	const bytes = new Uint8Array(size);
	return new File([bytes], name, {
		lastModified: 1_700_000_000_000,
		type,
	});
}

interface TestDataTransfer {
	readonly files: ArrayLike<File>;
	readonly types: ArrayLike<string>;
}

export function createMockDataTransfer(
	files: readonly File[]
): TestDataTransfer {
	if (typeof DataTransfer !== "undefined") {
		const dataTransfer = new DataTransfer();
		for (const file of files) {
			dataTransfer.items.add(file);
		}
		return dataTransfer;
	}

	return {
		files,
		types: ["Files"],
	};
}

export function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

function dispatchDrop(element: HTMLElement, files: readonly File[]): void {
	const dataTransfer = createMockDataTransfer(files);
	const dragOverEvent = new Event("dragover", {
		bubbles: true,
		cancelable: true,
	});
	Object.defineProperty(dragOverEvent, "dataTransfer", {
		value: dataTransfer,
	});
	element.dispatchEvent(dragOverEvent);

	const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
	Object.defineProperty(dropEvent, "dataTransfer", { value: dataTransfer });
	element.dispatchEvent(dropEvent);
}

export function dispatchDragEnter(element: HTMLElement): void {
	element.dispatchEvent(new Event("dragenter", { bubbles: true }));
}

export function dispatchDragLeave(element: HTMLElement): void {
	element.dispatchEvent(new Event("dragleave", { bubbles: true }));
}

export function getSlot<T extends HTMLElement = HTMLElement>(
	container: HTMLElement,
	slotName: string
): T | null {
	return container.querySelector<T>(`[data-slot="${slotName}"]`);
}

export function getAllSlots<T extends HTMLElement = HTMLElement>(
	container: HTMLElement,
	slotName: string
): NodeListOf<T> {
	return container.querySelectorAll<T>(`[data-slot="${slotName}"]`);
}

export function selectFiles(
	input: HTMLInputElement,
	files: readonly File[]
): void {
	const dataTransfer = createMockDataTransfer(files);
	Object.defineProperty(input, "files", {
		configurable: true,
		value: dataTransfer.files,
	});
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function triggerSelect(
	container: HTMLElement,
	files: readonly File[]
): void {
	const input = getSlot<HTMLInputElement>(container, "file-upload-input");
	if (input) {
		act(() => selectFiles(input, files));
	}
}

export function triggerDrop(
	container: HTMLElement,
	files: readonly File[]
): void {
	const dropzone = getSlot(container, "file-upload-dropzone");
	if (dropzone) {
		act(() => dispatchDrop(dropzone, files));
	}
}
