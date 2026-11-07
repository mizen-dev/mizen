import type { ChangeEvent, FocusEvent, RefCallback, RefObject } from "react";
import { createContext, use } from "react";

export function syncInputFiles(
	input: HTMLInputElement | null,
	files: readonly File[]
): void {
	if (!input) {
		return;
	}
	if (files.length === 0) {
		input.value = "";
		if (typeof DataTransfer !== "undefined") {
			input.files = new DataTransfer().files;
		}
		return;
	}
	if (typeof DataTransfer === "undefined") {
		return;
	}
	const dataTransfer = new DataTransfer();
	for (const file of files) {
		dataTransfer.items.add(file);
	}
	if (Object.hasOwn(input, "files")) {
		Reflect.deleteProperty(input, "files");
	}
	input.files = dataTransfer.files;
}

export function stripForbidden<T extends object>(
	target: T,
	extraKeys: readonly string[] = []
): T {
	const clone = { ...target };
	Reflect.deleteProperty(clone, "className");
	Reflect.deleteProperty(clone, "data-slot");
	Reflect.deleteProperty(clone, "style");
	for (const key of extraKeys) {
		Reflect.deleteProperty(clone, key);
	}
	return clone;
}

export function restoreFocusAfterRemoval(
	root: HTMLElement | null,
	removeIndex: number,
	fallbackTrigger: HTMLElement | null
): void {
	if (!root) {
		return;
	}
	const buttons = root.querySelectorAll<HTMLButtonElement>(
		'[data-slot="file-upload-item-remove"]'
	);
	if (buttons[removeIndex]) {
		buttons[removeIndex]?.focus();
	} else if (removeIndex > 0 && buttons[removeIndex - 1]) {
		buttons[removeIndex - 1]?.focus();
	} else {
		fallbackTrigger?.focus();
	}
}

export function attachFormResetListener(
	node: HTMLInputElement,
	onReset: () => void
): (() => void) | undefined {
	let currentForm = node.form;
	let isActive = true;

	const handleReset = (event: Event) => {
		const target = event.currentTarget;
		queueMicrotask(() => {
			if (!isActive || event.defaultPrevented || node.form !== target) {
				return;
			}
			onReset();
		});
	};

	currentForm?.addEventListener("reset", handleReset);

	const syncOwner = () => {
		const nextForm = node.form;
		if (nextForm === currentForm) {
			return;
		}
		currentForm?.removeEventListener("reset", handleReset);
		currentForm = nextForm;
		currentForm?.addEventListener("reset", handleReset);
	};

	const observer =
		typeof MutationObserver === "undefined"
			? null
			: new MutationObserver(syncOwner);
	observer?.observe(node, { attributeFilter: ["form"], attributes: true });

	if (!(currentForm || observer)) {
		return;
	}

	return () => {
		isActive = false;
		observer?.disconnect();
		currentForm?.removeEventListener("reset", handleReset);
	};
}

export function computeNextFiles(
	committed: readonly File[],
	accepted: readonly File[],
	maxFiles: number
): File[] {
	if (maxFiles === 1) {
		const last = accepted.at(-1);
		return last ? [last] : [...committed];
	}
	return [...committed, ...accepted];
}

export interface ChangeDetailsControls {
	cancel: () => void;
	readonly isCanceled: boolean;
}

export function createChangeDetails<T extends object>(
	data: T
): T & ChangeDetailsControls {
	let canceled = false;
	return {
		...data,
		cancel: () => {
			canceled = true;
		},
		get isCanceled(): boolean {
			return canceled;
		},
	};
}

export interface FileUploadContextValue {
	accept?: string;
	disabled: boolean;
	files: readonly File[];
	handleDropFiles: (files: readonly File[]) => void;
	handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	inputRef: RefObject<HTMLInputElement | null>;
	maxFiles: number;
	name?: string;
	onBlur?: (event: FocusEvent<HTMLElement>) => void;
	openPicker: () => void;
	removeFile: (index: number, expectedFile?: File) => void;
	rootRef: RefObject<HTMLDivElement | null>;
	setInputCallbackRef: RefCallback<HTMLInputElement>;
	triggerRef: RefObject<HTMLButtonElement | null>;
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(
	null
);

export function useFileUploadContext(): FileUploadContextValue {
	const context = use(FileUploadContext);
	if (!context) {
		throw new Error(
			"FileUpload compound components must be rendered inside a <FileUpload> provider."
		);
	}
	return context;
}

export interface FileUploadItemContextValue {
	file: File;
	index: number;
	layout?: "row" | "tile" | "upload";
}

export const FileUploadItemContext =
	createContext<FileUploadItemContextValue | null>(null);

export function useFileUploadItemContext(): FileUploadItemContextValue {
	const context = use(FileUploadItemContext);
	if (!context) {
		throw new Error(
			"FileUploadItem compound components must be rendered inside a <FileUploadItem> provider."
		);
	}
	return context;
}
