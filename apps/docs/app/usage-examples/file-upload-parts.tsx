"use client";
import type { FileUploadDropzoneState, FileUploadStatus } from "@mizen/ui";
import {
	Button,
	FileUploadItemName,
	FileUploadItemPreview,
	FileUploadItemProgress,
	FileUploadItemRemove,
	FileUploadItemSize,
	FileUploadItemStatus,
	FileUploadTrigger,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { IconAlertCircle, IconUpload } from "@tabler/icons-react";
import type { MouseEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { FileTypeIcon } from "../compositions/file-type-icon";
import { uploadPreviewStyles } from "./file-upload-preview.styles";

function promptTitle({ dragCount, isDragging }: FileUploadDropzoneState) {
	if (!isDragging) {
		return "Drop files here";
	}
	if (dragCount === 0) {
		return "Release to add files";
	}
	return `Drop ${dragCount} ${dragCount === 1 ? "file" : "files"}`;
}

// The limits line doubles as the error line, so a rejection moves nothing.
export function FileUploadPrompt({
	error,
	state,
	triggerTestId,
}: {
	error?: string;
	state: FileUploadDropzoneState;
	triggerTestId?: string;
}) {
	const Icon = error ? IconAlertCircle : IconUpload;
	return (
		<>
			<span
				aria-hidden="true"
				{...props(
					uploadPreviewStyles.icon,
					Boolean(error) && uploadPreviewStyles.rejectIcon
				)}
			>
				<Icon size={20} stroke={1.75} />
			</span>
			<div {...props(uploadPreviewStyles.copy)}>
				<p {...props(uploadPreviewStyles.title)}>{promptTitle(state)}</p>
				<p
					aria-live="polite"
					{...props(
						uploadPreviewStyles.limits,
						Boolean(error) && uploadPreviewStyles.limitsError
					)}
				>
					{error ?? "Images or PDF up to 5 MB (maximum 3 files)"}
				</p>
			</div>
			<FileUploadTrigger data-testid={triggerTestId}>
				Choose files
			</FileUploadTrigger>
		</>
	);
}

function uploadStatus(
	simulate: boolean,
	failed: boolean,
	progress: number,
	disabled?: boolean
): { status: FileUploadStatus; label: string } {
	if (disabled) {
		return { label: "Upload disabled", status: "pending" };
	}
	if (!simulate) {
		return { label: "Ready to upload", status: "pending" };
	}
	if (failed) {
		return { label: "Upload failed", status: "error" };
	}
	if (progress === 100) {
		return { label: "Uploaded", status: "success" };
	}
	return { label: "Uploading", status: "uploading" };
}

export function FileUploadRow({
	file,
	simulate = false,
	failFirstAttempt,
	disabled,
}: {
	file: File;
	simulate?: boolean;
	failFirstAttempt?: boolean;
	disabled?: boolean;
}) {
	const [progress, setProgress] = useState(0);
	const progressRef = useRef(0);
	const [failed, setFailed] = useState(false);
	const [attempt, setAttempt] = useState(0);
	const startSimulation = useCallback(
		(node: HTMLDivElement | null) => {
			if (!(node && simulate) || disabled || failed) {
				return;
			}
			const timer = window.setInterval(() => {
				progressRef.current = Math.min(100, progressRef.current + 5);
				setProgress(progressRef.current);
				if (failFirstAttempt && attempt === 0 && progressRef.current === 40) {
					setFailed(true);
					window.clearInterval(timer);
				}
				if (progressRef.current === 100) {
					window.clearInterval(timer);
				}
			}, 200);
			return () => window.clearInterval(timer);
		},
		[simulate, disabled, failFirstAttempt, attempt, failed]
	);
	const retry = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		event.currentTarget
			.closest('[data-slot="file-upload-item"]')
			?.querySelector<HTMLButtonElement>(
				'[data-slot="file-upload-item-remove"]'
			)
			?.focus();
		progressRef.current = 0;
		setProgress(0);
		setFailed(false);
		setAttempt((value) => value + 1);
	}, []);
	const { status, label } = uploadStatus(simulate, failed, progress, disabled);
	return (
		<div ref={startSimulation} {...props(uploadPreviewStyles.upload)}>
			<div {...props(uploadPreviewStyles.header)}>
				<FileUploadItemPreview>
					<FileTypeIcon file={file} />
				</FileUploadItemPreview>
				<div {...props(uploadPreviewStyles.metadata)}>
					<FileUploadItemName />
					<div {...props(uploadPreviewStyles.detail)}>
						<FileUploadItemSize />
						<FileUploadItemStatus status={status}>{label}</FileUploadItemStatus>
					</div>
				</div>
				<div {...props(uploadPreviewStyles.actions)}>
					<FileUploadItemRemove />
					{simulate ? (
						<span
							{...props(
								uploadPreviewStyles.percentage,
								failed && uploadPreviewStyles.percentageError,
								progress === 100 && uploadPreviewStyles.percentageSuccess,
								disabled && uploadPreviewStyles.percentageDisabled
							)}
						>
							{progress}%
						</span>
					) : null}
				</div>
			</div>
			{failed ? (
				<>
					<div role="alert">
						<Text size="ui" tone="muted">
							Connection lost. Try uploading this file again.
						</Text>
					</div>
					<Button disabled={disabled} onClick={retry} variant="outline">
						Retry upload
					</Button>
				</>
			) : null}
			{simulate ? (
				<div
					{...props(
						uploadPreviewStyles.progressSlot,
						progress === 100 && uploadPreviewStyles.progressSlotDone
					)}
				>
					<div {...props(uploadPreviewStyles.progressClip)}>
						<FileUploadItemProgress value={progress} />
					</div>
				</div>
			) : null}
		</div>
	);
}
