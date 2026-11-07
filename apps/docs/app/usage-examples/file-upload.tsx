"use client";
import { props } from "@stylexjs/stylex";
import { uploadPreviewStyles } from "./file-upload-preview.styles";
import { FileUploadDragAndDropFilesHereExample1 } from "./file-upload-variants";

export function LocalFileSelection() {
	return (
		<div {...props(uploadPreviewStyles.root)}>
			<FileUploadDragAndDropFilesHereExample1 testHooks={false} />
		</div>
	);
}
