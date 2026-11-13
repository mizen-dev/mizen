import { Stack, Text, Timestamp } from "@mizen-labs/ui";
import { richContentDateTime } from "../compositions/rich-content-source";

// The section already states the day, so the status line shows only the time.
export function TimestampTimeOnlyExample2() {
	return (
		<Stack gap="1">
			<Text>Today</Text>
			<Text tone="muted">
				Received{" "}
				<Timestamp
					dateTime={richContentDateTime}
					format="time"
					locale="en-US"
					timeZone="UTC"
				/>
			</Text>
		</Stack>
	);
}

export function TimestampDocumentHistoryExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Stack gap="1">
					<Text>Published</Text>
					<Text>
						<Timestamp
							dateTime={richContentDateTime}
							format="date"
							locale="en-US"
							timeZone="UTC"
						/>
					</Text>
					<Text>Updated</Text>
					<Text>
						<Timestamp
							dateTime={richContentDateTime}
							format="date-time"
							locale="en-US"
							timeZone="UTC"
						/>
					</Text>
				</Stack>
			</Stack>
		</Stack>
	);
}
