import { props } from "@stylexjs/stylex";
import type { DragEvent, MouseEvent, RefCallback } from "react";
import { useCallback, useRef, useState } from "react";
import { assignRef } from "../../ref-utils";
import { shape } from "../../styles/shape.stylex";
import { Button } from "../button/button";
import { fileUploadStyles } from "./file-upload.styles";
import type {
	FileUploadDropzoneProps,
	FileUploadInputProps,
	FileUploadTriggerProps,
} from "./file-upload.types";
import { stripForbidden, useFileUploadContext } from "./file-upload-context";

const FORBIDDEN_INPUT_KEYS = [
	"accept",
	"defaultValue",
	"disabled",
	"multiple",
	"name",
	"onChange",
	"required",
	"type",
	"value",
] as const;

// null when the drag carries no files, such as selected text.
function draggedFileCount(transfer: DataTransfer | null): number | null {
	const types = Array.from(transfer?.types ?? []);
	if (types.length > 0 && !types.includes("Files")) {
		return null;
	}
	return transfer?.items?.length ?? 0;
}

const dropzoneEdge = (
	<svg
		aria-hidden="true"
		focusable="false"
		{...props(fileUploadStyles.dropzoneEdge)}
	>
		<rect
			// StyleX has no SVG geometry, so the half-pixel inset lives here:
			// it keeps the 1px line inside the edge, with the corner radius.
			style={{
				height: "calc(100% - 1px)",
				rx: `calc(${shape.controlRadiusLarge} - 0.5px)`,
				width: "calc(100% - 1px)",
				x: "0.5px",
				y: "0.5px",
			}}
		/>
	</svg>
);

export function FileUploadDropzone({
	children,
	disabled = false,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	ref: forwardedRef,
	...rest
}: FileUploadDropzoneProps) {
	const context = useFileUploadContext();
	// null while nothing is dragged over; 0 when the browser hides the count.
	const [dragCount, setDragCount] = useState<number | null>(null);
	const isDragging = dragCount !== null;
	const depthRef = useRef(0);
	const isDisabled = context.disabled || disabled;

	const mergedRef: RefCallback<HTMLDivElement> = useCallback(
		(node) => {
			if (node && isDisabled) {
				depthRef.current = 0;
				setDragCount(null);
			}
			const consumerCleanup = assignRef(forwardedRef, node);
			return () => {
				depthRef.current = 0;
				consumerCleanup?.();
			};
		},
		[forwardedRef, isDisabled]
	);

	const handleDragEnter = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (isDisabled) {
				return;
			}
			onDragEnter?.(event);
			if (event.defaultPrevented) {
				return;
			}
			const count = draggedFileCount(event.dataTransfer);
			if (count === null) {
				return;
			}
			event.preventDefault();
			depthRef.current += 1;
			if (depthRef.current === 1) {
				setDragCount(count);
			}
		},
		[isDisabled, onDragEnter]
	);

	const handleDragLeave = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (isDisabled) {
				depthRef.current = 0;
				setDragCount(null);
				return;
			}
			onDragLeave?.(event);
			depthRef.current = Math.max(0, depthRef.current - 1);
			if (depthRef.current === 0) {
				setDragCount(null);
			}
		},
		[isDisabled, onDragLeave]
	);

	const handleDragOver = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (isDisabled) {
				event.preventDefault();
				return;
			}
			onDragOver?.(event);
			if (event.defaultPrevented) {
				return;
			}
			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = "copy";
			}
		},
		[isDisabled, onDragOver]
	);

	const handleDrop = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			if (isDisabled) {
				event.preventDefault();
				depthRef.current = 0;
				setDragCount(null);
				return;
			}
			onDrop?.(event);
			depthRef.current = 0;
			setDragCount(null);
			if (event.defaultPrevented) {
				return;
			}
			event.preventDefault();
			const files = event.dataTransfer?.files;
			if (files && files.length > 0) {
				context.handleDropFiles(Array.from(files));
			}
		},
		[context, isDisabled, onDrop]
	);

	const cleanProps = stripForbidden(rest);
	const content =
		typeof children === "function"
			? children({ dragCount: dragCount ?? 0, isDragging })
			: children;

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Native HTML drag and drop target container
		// biome-ignore lint/a11y/noStaticElementInteractions: Dropzone receives drag events on host div
		<div
			{...cleanProps}
			data-disabled={isDisabled ? "" : undefined}
			data-dragging={!isDisabled && isDragging ? "" : undefined}
			data-slot="file-upload-dropzone"
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			ref={mergedRef}
			{...props(fileUploadStyles.dropzone)}
		>
			{content}
			{dropzoneEdge}
		</div>
	);
}

export function FileUploadTrigger({
	children,
	disabled = false,
	onClick,
	ref: forwardedRef,
	...rest
}: FileUploadTriggerProps) {
	const context = useFileUploadContext();
	const { triggerRef } = context;
	const isDisabled = context.disabled || disabled;

	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			onClick?.(event);
			if (!(event.defaultPrevented || isDisabled)) {
				context.openPicker();
			}
		},
		[context, isDisabled, onClick]
	);

	const mergedRef: RefCallback<HTMLButtonElement> = useCallback(
		(node) => {
			const internalCleanup = assignRef(triggerRef, node);
			const consumerCleanup = assignRef(forwardedRef, node);
			return () => {
				internalCleanup?.();
				consumerCleanup?.();
			};
		},
		[triggerRef, forwardedRef]
	);

	const cleanProps = stripForbidden(rest, ["type"]);

	return (
		<Button
			{...cleanProps}
			data-slot="file-upload-trigger"
			disabled={isDisabled}
			onClick={handleClick}
			ref={mergedRef}
			size="sm"
			type="button"
			variant="outline"
		>
			{children}
		</Button>
	);
}

export function FileUploadInput({
	ref: forwardedRef,
	...rest
}: FileUploadInputProps) {
	const context = useFileUploadContext();
	const { setInputCallbackRef } = context;
	const cleanProps = stripForbidden(rest, FORBIDDEN_INPUT_KEYS);

	const mergedRef: RefCallback<HTMLInputElement> = useCallback(
		(node) => {
			const internalCleanup = setInputCallbackRef(node);
			const consumerCleanup = assignRef(forwardedRef, node);
			return () => {
				internalCleanup?.();
				consumerCleanup?.();
			};
		},
		[setInputCallbackRef, forwardedRef]
	);

	return (
		<input
			{...cleanProps}
			accept={context.accept}
			data-slot="file-upload-input"
			disabled={context.disabled}
			multiple={context.maxFiles > 1}
			name={context.name}
			onChange={context.handleInputChange}
			ref={mergedRef}
			tabIndex={-1}
			type="file"
			{...props(fileUploadStyles.hiddenInput)}
		/>
	);
}
