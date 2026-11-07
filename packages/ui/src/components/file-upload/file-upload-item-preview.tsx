import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { fileUploadStyles } from "./file-upload.styles";
import { useFileUploadItemContext } from "./file-upload-context";

export interface FileUploadItemPreviewProps {
	children: ReactNode;
}

export function FileUploadItemPreview({
	children,
}: FileUploadItemPreviewProps) {
	const { file, layout } = useFileUploadItemContext();
	const [failedFile, setFailedFile] = useState<File | null>(null);
	const image = file.type.startsWith("image/") && failedFile !== file;
	const fail = useCallback(() => setFailedFile(file), [file]);
	const previewRef = useCallback(
		(node: HTMLImageElement | null) => {
			if (!node) {
				return;
			}
			const url = URL.createObjectURL(file);
			node.src = url;
			return () => URL.revokeObjectURL(url);
		},
		[file]
	);
	return (
		<div
			data-slot="file-upload-item-preview"
			title={file.name}
			{...props(
				fileUploadStyles.preview,
				image && fileUploadStyles.previewFull,
				layout === "row" && fileUploadStyles.previewRow,
				layout === "upload" && fileUploadStyles.previewUpload
			)}
		>
			{image ? (
				// biome-ignore lint/performance/noImgElement: Local blob previews cannot use a framework image optimizer.
				// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Decode errors switch to the document fallback; this is not an input event.
				<img
					alt={file.name}
					height={72}
					onError={fail}
					ref={previewRef}
					width={72}
					{...props(fileUploadStyles.previewImage)}
				/>
			) : (
				children
			)}
		</div>
	);
}
