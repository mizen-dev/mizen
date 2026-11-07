import type { ComponentPropsWithRef, FocusEvent, ReactNode, Ref } from "react";
import type { FileRejection } from "./file-upload-validation";

export type FileUploadStatus = "error" | "pending" | "success" | "uploading";

export type FileUploadChangeDetails =
	| {
			readonly accepted: readonly File[];
			readonly cancel: () => void;
			readonly isCanceled: boolean;
			readonly reason: "picker";
			readonly rejected: readonly FileRejection[];
	  }
	| {
			readonly accepted: readonly File[];
			readonly cancel: () => void;
			readonly isCanceled: boolean;
			readonly reason: "drop";
			readonly rejected: readonly FileRejection[];
	  }
	| {
			readonly cancel: () => void;
			readonly file: File;
			readonly index: number;
			readonly isCanceled: boolean;
			readonly reason: "remove";
	  };

abstract class BivariantWrapper<T extends (...args: never[]) => unknown> {
	abstract bivariance(...args: Parameters<T>): ReturnType<T>;
}

type BivariantCallback<T extends (...args: never[]) => unknown> =
	BivariantWrapper<T>["bivariance"];

export type FileUploadProps = Omit<
	ComponentPropsWithRef<"div">,
	| "className"
	| "data-slot"
	| "defaultValue"
	| "multiple"
	| "required"
	| "style"
	| "value"
> & {
	accept?: string;
	children?: ReactNode;
	defaultValue?: readonly File[];
	disabled?: boolean;
	maxFiles?: number;
	maxSize?: number;
	name?: string;
	onBlur?: (event: FocusEvent<HTMLElement>) => void;
	onFileReject?: BivariantCallback<
		(rejections: readonly FileRejection[]) => void
	>;
	onValueChange?: BivariantCallback<
		(files: readonly File[], details: FileUploadChangeDetails) => void
	>;
	ref?: Ref<HTMLDivElement>;
	value?: readonly File[];
};

export interface FileUploadDropzoneState {
	/** Files under the pointer; 0 when the browser hides the count. */
	dragCount: number;
	isDragging: boolean;
}

export type FileUploadDropzoneProps = Omit<
	ComponentPropsWithRef<"div">,
	"children" | "className" | "data-slot" | "style"
> & {
	children?: ReactNode | ((state: FileUploadDropzoneState) => ReactNode);
	disabled?: boolean;
	ref?: Ref<HTMLDivElement>;
};

export type FileUploadTriggerProps = Omit<
	ComponentPropsWithRef<"button">,
	"className" | "data-slot" | "style" | "type"
> & {
	disabled?: boolean;
	ref?: Ref<HTMLButtonElement>;
};

export type FileUploadInputProps = Omit<
	ComponentPropsWithRef<"input">,
	| "accept"
	| "children"
	| "className"
	| "data-slot"
	| "defaultValue"
	| "disabled"
	| "multiple"
	| "name"
	| "onChange"
	| "required"
	| "style"
	| "type"
	| "value"
> & {
	ref?: Ref<HTMLInputElement>;
};

export type FileUploadListProps = Omit<
	ComponentPropsWithRef<"ul">,
	"children" | "className" | "data-slot" | "style"
> & {
	children?: ReactNode | ((file: File, index: number) => ReactNode);
	layout?: "rows" | "tiles";
	ref?: Ref<HTMLUListElement>;
};

export type FileUploadItemProps = Omit<
	ComponentPropsWithRef<"li">,
	"className" | "data-slot" | "style"
> & {
	file: File;
	index: number;
	layout?: "row" | "tile" | "upload";
	ref?: Ref<HTMLLIElement>;
};

export type FileUploadItemNameProps = Omit<
	ComponentPropsWithRef<"span">,
	"className" | "data-slot" | "style"
> & {
	ref?: Ref<HTMLSpanElement>;
};

export type FileUploadItemSizeProps = Omit<
	ComponentPropsWithRef<"span">,
	"className" | "data-slot" | "style"
> & {
	ref?: Ref<HTMLSpanElement>;
};

export type FileUploadItemStatusProps = Omit<
	ComponentPropsWithRef<"span">,
	"className" | "data-slot" | "style"
> & {
	ref?: Ref<HTMLSpanElement>;
	status?: FileUploadStatus;
};

export type FileUploadItemProgressProps = Omit<
	ComponentPropsWithRef<"div">,
	"children" | "className" | "data-slot" | "style"
> & {
	ref?: Ref<HTMLDivElement>;
	value?: number | null;
};

export type FileUploadItemRemoveProps = Omit<
	ComponentPropsWithRef<"button">,
	"className" | "data-slot" | "style" | "type"
> & {
	disabled?: boolean;
	ref?: Ref<HTMLButtonElement>;
};
