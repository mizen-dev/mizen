import {
	Button,
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@mizen/ui";
import { IconFolder } from "@tabler/icons-react";

export function NoRepositories() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<IconFolder aria-hidden="true" size="18" />
				</EmptyMedia>
				<EmptyTitle>No repositories yet</EmptyTitle>
				<EmptyDescription>
					Create a repository to begin collaborating with your team.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button>Create repository</Button>
			</EmptyContent>
		</Empty>
	);
}
