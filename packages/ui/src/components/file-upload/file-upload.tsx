"use client";

import { props as stylexProps } from "@stylexjs/stylex";
import type { ChangeEvent, FocusEvent, RefCallback } from "react";
import { useCallback, useRef, useState } from "react";
import { assignRef } from "../../ref-utils";
import { fileUploadStyles } from "./file-upload.styles";
import type { FileUploadProps } from "./file-upload.types";
import {
	attachFormResetListener,
	computeNextFiles,
	createChangeDetails,
	FileUploadContext,
	restoreFocusAfterRemoval,
	stripForbidden,
	syncInputFiles,
} from "./file-upload-context";
import {
	FileUploadDropzone as BaseDropzone,
	FileUploadInput as BaseInput,
	FileUploadTrigger as BaseTrigger,
} from "./file-upload-controls";
import { FileUploadItemPreview as BaseItemPreview } from "./file-upload-item-preview";
import {
	FileUploadItem as BaseItem,
	FileUploadItemName as BaseItemName,
	FileUploadItemProgress as BaseItemProgress,
	FileUploadItemRemove as BaseItemRemove,
	FileUploadItemSize as BaseItemSize,
	FileUploadItemStatus as BaseItemStatus,
	FileUploadList as BaseList,
} from "./file-upload-items";
import { cloneRejections, validateFiles } from "./file-upload-validation";

const NO_FILES: readonly File[] = [];

export function FileUpload({
	accept,
	children,
	defaultValue,
	disabled = false,
	maxFiles = 1,
	maxSize,
	name,
	onBlur,
	onFileReject,
	onValueChange,
	ref: forwardedRef,
	value,
	...rest
}: FileUploadProps) {
	// Controlled or not is fixed at mount, like a native input.
	const [isControlled] = useState(value !== undefined);
	const initialFiles = defaultValue ? [...defaultValue] : [];
	const [uncontrolledFiles, setUncontrolledFiles] =
		useState<readonly File[]>(initialFiles);
	const [message, setMessage] = useState("");
	const [revision, setRevision] = useState(0);
	const announce = (m: string) => {
		setMessage(m);
		setRevision((r) => r + 1);
	};

	const currentFiles = isControlled ? (value ?? NO_FILES) : uncontrolledFiles;
	const initialDefaultRef = useRef(initialFiles);
	const controlledSnapshotRef = useRef({
		files: isControlled ? (value ?? NO_FILES) : NO_FILES,
		revision: 0,
	});

	const rootRef = useRef<HTMLDivElement>(null),
		inputRef = useRef<HTMLInputElement>(null),
		triggerRef = useRef<HTMLButtonElement>(null);

	const setInputCallbackRef: RefCallback<HTMLInputElement> = useCallback(
		(node) => {
			inputRef.current = node;
			if (!node) {
				return;
			}
			if (isControlled) {
				controlledSnapshotRef.current.files = currentFiles;
				controlledSnapshotRef.current.revision += 1;
			}
			syncInputFiles(node, currentFiles);

			const removeResetListener = attachFormResetListener(node, () => {
				const target = isControlled
					? (value ?? NO_FILES)
					: initialDefaultRef.current;
				if (!isControlled) {
					setUncontrolledFiles(target);
				}
				syncInputFiles(node, target);
			});

			return () => {
				inputRef.current = null;
				removeResetListener?.();
			};
		},
		[currentFiles, isControlled, value]
	);

	const commitTransition = (
		nextFiles: File[],
		details: { readonly isCanceled: boolean },
		action?: () => void
	) => {
		const snap = controlledSnapshotRef.current;
		const startRevision = snap.revision;
		const committed = isControlled ? snap.files : currentFiles;
		syncInputFiles(inputRef.current, nextFiles);
		let succeeded = false;
		try {
			action?.();
			succeeded = !details.isCanceled;
		} finally {
			if (isControlled) {
				syncInputFiles(
					inputRef.current,
					snap.revision > startRevision ? snap.files : committed
				);
			} else if (succeeded) {
				setUncontrolledFiles(nextFiles);
			} else {
				syncInputFiles(inputRef.current, committed);
			}
		}
	};

	const processIncomingFiles = (
		incoming: readonly File[],
		source: "picker" | "drop"
	) => {
		const { accepted, rejected } = validateFiles(incoming, {
			accept,
			currentFiles,
			maxFiles,
			maxSize,
		});
		const nextFiles = computeNextFiles(currentFiles, accepted, maxFiles);
		const details = createChangeDetails({
			accepted: [...accepted],
			reason: source,
			rejected: cloneRejections(rejected),
		});
		const msg = rejected.length
			? `Rejected ${rejected.map((r) => r.file.name).join(", ")}`
			: "";

		commitTransition(nextFiles, details, () => {
			if (msg) {
				onFileReject?.(cloneRejections(rejected));
				announce(msg);
			}
			onValueChange?.([...nextFiles], details);
		});
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		if (files.length > 0) {
			processIncomingFiles(files, "picker");
		}
	};

	const removeFile = (removeIndex: number, expectedFile?: File) => {
		const file = currentFiles[removeIndex];
		if (!file || (expectedFile && file !== expectedFile)) {
			return;
		}

		const nextFiles = currentFiles.filter((_, index) => index !== removeIndex);
		const details = createChangeDetails({
			file,
			index: removeIndex,
			reason: "remove" as const,
		});

		commitTransition(nextFiles, details, () => {
			onValueChange?.([...nextFiles], details);
		});

		if (!details.isCanceled) {
			announce(`Removed ${file.name}`);
			queueMicrotask?.(() =>
				restoreFocusAfterRemoval(
					rootRef.current,
					removeIndex,
					triggerRef.current
				)
			);
		}
	};

	const mergedRootRef: RefCallback<HTMLDivElement> = useCallback(
		(node) => {
			rootRef.current = node;
			const consumerCleanup = assignRef(forwardedRef, node);
			return () => {
				rootRef.current = null;
				consumerCleanup?.();
			};
		},
		[forwardedRef]
	);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLDivElement>) => {
			const target = event.relatedTarget;
			if (target instanceof Node && rootRef.current?.contains(target)) {
				return;
			}
			onBlur?.(event);
		},
		[onBlur]
	);
	const rootProps = { ...stripForbidden(rest), onBlur: handleBlur };

	return (
		<FileUploadContext
			value={{
				accept,
				disabled,
				files: currentFiles,
				handleDropFiles: (f: readonly File[]) =>
					processIncomingFiles(f, "drop"),
				handleInputChange,
				inputRef,
				maxFiles,
				name,
				onBlur,
				openPicker: () => inputRef.current?.click(),
				removeFile,
				rootRef,
				setInputCallbackRef,
				triggerRef,
			}}
		>
			<div
				{...rootProps}
				data-disabled={disabled ? "" : undefined}
				data-slot="file-upload"
				ref={mergedRootRef}
				{...stylexProps(fileUploadStyles.root)}
			>
				{children}
				<div
					aria-atomic="true"
					aria-live="polite"
					{...stylexProps(fileUploadStyles.liveRegion)}
				>
					{message ? <span key={revision}>{message}</span> : null}
				</div>
			</div>
		</FileUploadContext>
	);
}

export const FileUploadDropzone = BaseDropzone;
export const FileUploadTrigger = BaseTrigger;
export const FileUploadInput = BaseInput;
export const FileUploadList = BaseList;
export const FileUploadItem = BaseItem;
export type { FileUploadItemPreviewProps } from "./file-upload-item-preview";
export const FileUploadItemPreview = BaseItemPreview;
export const FileUploadItemName = BaseItemName;
export const FileUploadItemSize = BaseItemSize;
export const FileUploadItemStatus = BaseItemStatus;
export const FileUploadItemProgress = BaseItemProgress;
export const FileUploadItemRemove = BaseItemRemove;

export type * from "./file-upload.types";
export type {
	FileRejection,
	FileRejectionCode,
} from "./file-upload-validation";
