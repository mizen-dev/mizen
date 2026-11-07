"use client";

import type {
	FileRejection,
	FileRejectionCode,
	FileUploadChangeDetails,
} from "@mizen-labs/ui";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemRemove,
	FileUploadItemSize,
	FileUploadList,
	FileUploadTrigger,
	Heading,
	Inline,
	Spacer,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

const specimenStyles = create({
	root: {
		inlineSize: "100%",
		maxInlineSize: "44rem",
	},
});

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const REJECTION_MESSAGES = {
	"file-invalid-type": "Unsupported format. Select an image or PDF.",
	"file-too-large": "File exceeds the 5 MB size limit.",
	"too-many-files": "Maximum of 3 files allowed.",
} satisfies Record<FileRejectionCode, string>;

export function FileUploadSpecimen() {
	const [rejections, setRejections] = useState<readonly FileRejection[]>([]);

	const handleFileReject = useCallback((rejected: FileRejection[]) => {
		setRejections(rejected);
	}, []);

	const handleValueChange = useCallback(
		(_files: readonly File[], details: FileUploadChangeDetails) => {
			if (details.reason === "remove" || details.rejected.length === 0) {
				setRejections([]);
			}
		},
		[]
	);

	return (
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Attach the files your team needs for the release."
				primary
				title="Project files"
			>
				<div {...props(specimenStyles.root)}>
					<FileUpload
						accept="image/*,.pdf"
						data-testid="file-upload-specimen"
						maxFiles={3}
						maxSize={MAX_FILE_SIZE_BYTES}
						onFileReject={handleFileReject}
						onValueChange={handleValueChange}
					>
						<Stack gap="3">
							<FileUploadDropzone data-testid="file-upload-dropzone">
								<Heading level={3}>Drag and drop files here</Heading>
								<FileUploadTrigger data-testid="file-upload-trigger">
									Choose files
								</FileUploadTrigger>
								<Text size="ui" tone="muted">
									Images or PDF up to 5 MB (maximum 3 files)
								</Text>
							</FileUploadDropzone>
							<FileUploadInput />

							{rejections.length > 0 && (
								<Stack aria-atomic="true" aria-live="assertive" gap="1">
									{rejections.map((rejection) => (
										<Text
											key={`${rejection.file.name}-${rejection.code}`}
											size="ui"
											tone="muted"
										>
											{rejection.file.name}:{" "}
											{REJECTION_MESSAGES[rejection.code]}
										</Text>
									))}
								</Stack>
							)}

							<FileUploadList data-testid="file-upload-list">
								{(file, index) => (
									<FileUploadItem
										file={file}
										index={index}
										key={`${file.name}-${index}`}
									>
										<Inline>
											<FileUploadItemName />
											<FileUploadItemSize />
											<Spacer />
											<FileUploadItemRemove />
										</Inline>
									</FileUploadItem>
								)}
							</FileUploadList>

							<Text size="ui" tone="muted">
								Files stay in this browser example; no upload starts.
							</Text>
						</Stack>
					</FileUpload>
				</div>
			</SpecimenSection>
		</div>
	);
}
