"use client";
import { Badge, ListItem, OverflowList, Stack } from "@mizen-labs/ui";

export function OverflowListReleaseContributorsExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<OverflowList
					aria-label="Contributors"
					overflowLabel="More contributors"
					visibleCount={2}
				>
					<ListItem>
						<Badge variant="secondary">Maya Chen</Badge>
					</ListItem>
					<ListItem>
						<Badge variant="secondary">Alex Rivera</Badge>
					</ListItem>
					<ListItem>
						<Badge variant="secondary">Sam Jordan</Badge>
					</ListItem>
					<ListItem>
						<Badge variant="secondary">Rin Tanaka</Badge>
					</ListItem>
				</OverflowList>
			</Stack>
		</Stack>
	);
}
