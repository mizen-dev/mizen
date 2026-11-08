"use client";
import {
	Attachment,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentName,
	Link,
	Stack,
	Thumbnail,
} from "@mizen-labs/ui";

export function AttachmentReleaseFilesExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Attachment>
					<AttachmentMedia>
						<Thumbnail
							alt="Rows of lavender under a pink evening sky"
							size="default"
							src="/media/lavender-valensole.jpg"
						/>
					</AttachmentMedia>
					<AttachmentContent>
						<AttachmentName>lavender-valensole.jpg</AttachmentName>
						<AttachmentDescription>JPEG image · 271 KB</AttachmentDescription>
					</AttachmentContent>
					<AttachmentActions>
						<Link href="/components/attachment">View file details</Link>
					</AttachmentActions>
				</Attachment>
			</Stack>
		</Stack>
	);
}
