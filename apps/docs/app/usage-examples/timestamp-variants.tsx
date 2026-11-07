import { Stack, Text, Timestamp } from "@mizen/ui";
import { richContentDateTime } from "../compositions/rich-content-source";

export function TimestampDocumentHistoryExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Stack gap="1">
					<Text>Published</Text>
					<Timestamp
						dateTime={richContentDateTime}
						format="date"
						locale="en-US"
						timeZone="UTC"
					/>
					<Text>Updated</Text>
					<Timestamp
						dateTime={richContentDateTime}
						format="date-time"
						locale="en-US"
						timeZone="UTC"
					/>
				</Stack>
			</Stack>
		</Stack>
	);
}
