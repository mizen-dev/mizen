import { props } from "@stylexjs/stylex";
import type { MouseEvent, ReactNode, RefCallback } from "react";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { IconX } from "../../icons";
import { assignRef } from "../../ref-utils";
import { Progress } from "../progress/progress";
import { fileUploadStyles } from "./file-upload.styles";
import type {
	FileUploadItemNameProps,
	FileUploadItemProgressProps,
	FileUploadItemProps,
	FileUploadItemRemoveProps,
	FileUploadItemSizeProps,
	FileUploadItemStatusProps,
	FileUploadListProps,
} from "./file-upload.types";
import {
	FileUploadItemContext,
	stripForbidden,
	useFileUploadContext,
	useFileUploadItemContext,
} from "./file-upload-context";
import { collapseItem, growItem, settleList } from "./file-upload-motion";
import { formatFileSize } from "./file-upload-validation";

export function FileUploadList({
	children,
	layout = "rows",
	ref: forwardedRef,
	...rest
}: FileUploadListProps) {
	const context = useFileUploadContext();
	const cleanProps = stripForbidden(rest);
	// Children attach before the list, so only later items animate in.
	const mergedRef: RefCallback<HTMLUListElement> = useCallback(
		(node) => {
			settleList(node);
			return assignRef(forwardedRef, node);
		},
		[forwardedRef]
	);

	return (
		<ul
			{...cleanProps}
			data-slot="file-upload-list"
			ref={mergedRef}
			{...props(
				fileUploadStyles.list,
				layout === "tiles" ? fileUploadStyles.tiles : fileUploadStyles.rows
			)}
		>
			{typeof children === "function"
				? context.files.map((file, index) => children(file, index))
				: (children ?? null)}
		</ul>
	);
}

export function FileUploadItem({
	children,
	file,
	index,
	layout = "row",
	ref: forwardedRef,
	...rest
}: FileUploadItemProps) {
	const context = useFileUploadContext();
	const cleanProps = stripForbidden(rest);
	const mergedRef: RefCallback<HTMLLIElement> = useCallback(
		(node) => {
			growItem(node);
			return assignRef(forwardedRef, node);
		},
		[forwardedRef]
	);

	return (
		<FileUploadItemContext.Provider value={{ file, index, layout }}>
			<li
				{...cleanProps}
				data-disabled={context.disabled ? "" : undefined}
				data-layout={layout}
				data-slot="file-upload-item"
				ref={mergedRef}
				{...props(
					fileUploadStyles.item,
					layout === "upload" && fileUploadStyles.upload,
					layout === "tile" ? fileUploadStyles.tile : fileUploadStyles.rowItem
				)}
			>
				<div
					data-slot="file-upload-item-content"
					{...props(
						fileUploadStyles.itemContent,
						layout === "upload" && fileUploadStyles.uploadContent,
						layout === "tile" && fileUploadStyles.tileContent
					)}
				>
					{children}
				</div>
			</li>
		</FileUploadItemContext.Provider>
	);
}

export function FileUploadItemName({
	children,
	ref: forwardedRef,
	...rest
}: FileUploadItemNameProps) {
	const itemContext = useFileUploadItemContext();
	const cleanProps = stripForbidden(rest);

	return (
		<span
			{...cleanProps}
			data-slot="file-upload-item-name"
			ref={forwardedRef}
			title={cleanProps.title ?? itemContext.file.name}
			{...props(
				fileUploadStyles.name,
				itemContext.layout === "upload" && fileUploadStyles.uploadName,
				itemContext.layout === "tile" && fileUploadStyles.tileName
			)}
		>
			{children ?? itemContext.file.name}
		</span>
	);
}

export function FileUploadItemSize({
	children,
	ref: forwardedRef,
	...rest
}: FileUploadItemSizeProps) {
	const itemContext = useFileUploadItemContext();
	const cleanProps = stripForbidden(rest);

	return (
		<span
			{...cleanProps}
			data-slot="file-upload-item-size"
			ref={forwardedRef}
			{...props(fileUploadStyles.size)}
		>
			{children ?? formatFileSize(itemContext.file.size)}
		</span>
	);
}

// The check strokes on when an upload finishes, like the Checkbox mark. An
// item that is already done when it renders shows the check drawn.
function StatusCheck({
	status,
}: {
	status: FileUploadItemStatusProps["status"];
}) {
	const [shown, setShown] = useState(status);
	const [drawing, setDrawing] = useState(false);
	const settle = useCallback(() => setDrawing(false), []);
	if (status !== shown) {
		setShown(status);
		setDrawing(status === "success");
	}
	if (status !== "success") {
		return null;
	}
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			viewBox="0 0 16 16"
			{...props(fileUploadStyles.statusCheck)}
		>
			<path
				d="M3.5 8.5l3 3l6 -6.5"
				onAnimationEnd={settle}
				pathLength={1}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props(
					fileUploadStyles.statusCheckMark,
					drawing && fileUploadStyles.statusCheckDraw
				)}
			/>
		</svg>
	);
}

export function FileUploadItemStatus({
	children,
	ref: forwardedRef,
	status,
	...rest
}: FileUploadItemStatusProps) {
	const cleanProps = stripForbidden(rest);

	return (
		<span
			{...cleanProps}
			aria-atomic={cleanProps["aria-atomic"] ?? true}
			data-slot="file-upload-item-status"
			data-status={status}
			ref={forwardedRef}
			role={cleanProps.role ?? "status"}
			{...props(fileUploadStyles.status)}
		>
			<StatusCheck status={status} />
			{children ?? status}
		</span>
	);
}

export function FileUploadItemProgress({
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	ref: forwardedRef,
	value,
	...rest
}: FileUploadItemProgressProps) {
	const itemContext = useFileUploadItemContext();
	const cleanProps = stripForbidden(rest);
	const progressLabel =
		ariaLabel ??
		(ariaLabelledBy ? undefined : `${itemContext.file.name} progress`);

	return (
		<div
			{...cleanProps}
			data-slot="file-upload-item-progress"
			ref={forwardedRef}
			{...props(fileUploadStyles.progress)}
		>
			<Progress
				aria-label={progressLabel}
				aria-labelledby={ariaLabelledBy}
				value={value ?? null}
			/>
		</div>
	);
}

const defaultRemoveIcon = (
	<IconX aria-hidden="true" focusable="false" size="1em" />
);

function RemoveButtonContent({
	children,
	fileName,
	hasName,
}: {
	children: ReactNode;
	fileName: string;
	hasName: boolean;
}) {
	const needsFallback = children !== null && children !== undefined && !hasName;
	return (
		<>
			{children ?? defaultRemoveIcon}
			{needsFallback ? (
				<span {...props(fileUploadStyles.visuallyHidden)}>
					Remove {fileName}
				</span>
			) : null}
		</>
	);
}

export function FileUploadItemRemove({
	"aria-label": ariaLabel,
	children,
	disabled = false,
	onClick,
	ref: forwardedRef,
	...rest
}: FileUploadItemRemoveProps) {
	const context = useFileUploadContext();
	const itemContext = useFileUploadItemContext();
	const isDisabled = context.disabled || disabled;
	// The row collapses before removal, so read the newest file list then.
	const removeRef = useRef<() => void>(() => undefined);
	const mergedRef: RefCallback<HTMLButtonElement> = useCallback(
		(node) => {
			removeRef.current = () =>
				context.removeFile(itemContext.index, itemContext.file);
			return assignRef(forwardedRef, node);
		},
		[context, forwardedRef, itemContext.file, itemContext.index]
	);

	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			onClick?.(event);
			if (!(event.defaultPrevented || isDisabled)) {
				collapseItem(
					event.currentTarget.closest<HTMLElement>(
						"[data-slot='file-upload-item']"
					),
					() => flushSync(() => removeRef.current())
				);
			}
		},
		[isDisabled, onClick]
	);

	const cleanProps = stripForbidden(rest, ["type"]);
	const hasCustomName = ariaLabel || cleanProps["aria-labelledby"];
	const defaultAriaLabel =
		(children === null || children === undefined) && !hasCustomName
			? `Remove ${itemContext.file.name}`
			: undefined;

	return (
		<button
			{...cleanProps}
			aria-label={ariaLabel ?? defaultAriaLabel}
			data-slot="file-upload-item-remove"
			disabled={isDisabled}
			onClick={handleClick}
			ref={mergedRef}
			type="button"
			{...props(
				fileUploadStyles.remove,
				itemContext.layout === "tile" && fileUploadStyles.tileRemove
			)}
		>
			<RemoveButtonContent
				fileName={itemContext.file.name}
				hasName={Boolean(hasCustomName)}
			>
				{children}
			</RemoveButtonContent>
		</button>
	);
}
