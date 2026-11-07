"use client";
import type {
	FileRejection,
	FileRejectionCode,
	FileUploadChangeDetails,
} from "@mizen/ui";
import {
	Button,
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadList,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";
import { FileUploadPrompt, FileUploadRow } from "./file-upload-parts";
import { uploadPreviewStyles } from "./file-upload-preview.styles";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const REJECTION_MESSAGES = {
	"file-invalid-type": (name) => `${name} isn't an image or PDF.`,
	"file-too-large": (name) => `${name} is over 5 MB.`,
	"too-many-files": (name) => `${name} wasn't added. The limit is 3 files.`,
} satisfies Record<FileRejectionCode, (name: string) => string>;

function rejectionMessage(rejections: readonly FileRejection[]) {
	const [first, ...rest] = rejections;
	if (!first) {
		return;
	}
	const message = REJECTION_MESSAGES[first.code](first.file.name);
	if (rest.length === 0) {
		return message;
	}
	return `${message} ${rest.length} more ${rest.length === 1 ? "file was" : "files were"} skipped.`;
}
export function FileUploadDragAndDropFilesHereExample1({
	testHooks = true,
	disabled,
	failFirstAttempt,
}: {
	testHooks?: boolean;
	disabled?: boolean;
	failFirstAttempt?: boolean;
}) {
	const hooks = testHooks
		? {
				dropzone: "file-upload-dropzone",
				list: "file-upload-list",
				root: "file-upload-specimen",
				trigger: "file-upload-trigger",
			}
		: {};
	const fileKeys = useRef(new WeakMap<File, string>());
	const keyForFile = useCallback((file: File) => {
		const existing = fileKeys.current.get(file);
		if (existing) {
			return existing;
		}
		const key = crypto.randomUUID();
		fileKeys.current.set(file, key);
		return key;
	}, []);
	const [rejections, setRejections] = useState<readonly FileRejection[]>([]);
	const [files, setFiles] = useState<readonly File[]>([]);
	const handleFileReject = useCallback((rejected: FileRejection[]) => {
		setRejections(rejected);
	}, []);
	const handleValueChange = useCallback(
		(nextFiles: readonly File[], details: FileUploadChangeDetails) => {
			setFiles(nextFiles);
			if (details.reason === "remove" || details.rejected.length === 0) {
				setRejections([]);
			}
		},
		[]
	);
	return (
		<FileUpload
			accept="image/*,.png,.jpg,.jpeg,.gif,.webp,.heic,.avif,.pdf"
			data-testid={hooks.root}
			disabled={disabled}
			maxFiles={3}
			maxSize={MAX_FILE_SIZE_BYTES}
			onFileReject={handleFileReject}
			onValueChange={handleValueChange}
			value={files}
		>
			<Stack gap="3">
				<FileUploadDropzone data-testid={hooks.dropzone}>
					{(state) => (
						<FileUploadPrompt
							error={rejectionMessage(rejections)}
							state={state}
							triggerTestId={hooks.trigger}
						/>
					)}
				</FileUploadDropzone>
				<FileUploadInput />

				<FileUploadList data-testid={hooks.list}>
					{(file, index) => (
						<FileUploadItem
							file={file}
							index={index}
							key={keyForFile(file)}
							layout="upload"
						>
							<FileUploadRow
								disabled={disabled}
								failFirstAttempt={failFirstAttempt}
								file={file}
								simulate={!testHooks}
							/>
						</FileUploadItem>
					)}
				</FileUploadList>

				{testHooks ? (
					<Text size="ui" tone="muted">
						Files stay in this browser example; no upload starts.
					</Text>
				) : null}
			</Stack>
		</FileUpload>
	);
}

export function FileUploadRetryExample() {
	return (
		<div {...props(uploadPreviewStyles.root)}>
			<FileUploadDragAndDropFilesHereExample1
				failFirstAttempt
				testHooks={false}
			/>
		</div>
	);
}

export function FileUploadDisabledExample() {
	const [disabled, setDisabled] = useState(true);
	const toggleDisabled = useCallback(() => setDisabled((value) => !value), []);
	return (
		<div {...props(uploadPreviewStyles.root)}>
			<Stack gap="4">
				<FileUploadDragAndDropFilesHereExample1
					disabled={disabled}
					testHooks={false}
				/>
				<Button onClick={toggleDisabled} variant="outline">
					{disabled ? "Enable upload" : "Disable upload"}
				</Button>
			</Stack>
		</div>
	);
}
