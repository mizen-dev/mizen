import { Timestamp } from "@mizen/ui";

export function EditedAt() {
	// A fixed `now` keeps the docs stable; leave it out to count from render.
	return (
		<Timestamp
			dateTime="2026-10-10T09:30:00Z"
			format="relative"
			now="2026-10-10T11:45:00Z"
		/>
	);
}
