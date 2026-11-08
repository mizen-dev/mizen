import {
	Attachment,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentName,
	Button,
} from "@mizen-labs/ui";
import { IconDownload, IconFileSpreadsheet } from "@tabler/icons-react";

export function ReportAttachment() {
	return (
		<Attachment>
			<AttachmentMedia aria-hidden="true">
				<IconFileSpreadsheet size={20} stroke={1.75} />
			</AttachmentMedia>
			<AttachmentContent>
				<AttachmentName>monthly-report.csv</AttachmentName>
				<AttachmentDescription>CSV · 12 rows · 4 KB</AttachmentDescription>
			</AttachmentContent>
			<AttachmentActions>
				<Button
					aria-label="Download monthly-report.csv"
					size="icon-sm"
					variant="ghost"
				>
					<IconDownload aria-hidden="true" size="1em" />
				</Button>
			</AttachmentActions>
		</Attachment>
	);
}
