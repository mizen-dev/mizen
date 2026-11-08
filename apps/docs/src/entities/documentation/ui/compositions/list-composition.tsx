import {
	Badge,
	Inline,
	Link,
	List,
	ListActions,
	ListContent,
	ListItem,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { PreviewWorkspace } from "../../../../shared/ui/preview-workspace";
import { listCompositionStyles } from "./list-composition.styles";

const resources = [
	{
		description: "Button and toolbar patterns for common tasks.",
		href: "#compound-actions-heading",
		name: "Action controls",
		status: "Patterns",
	},
	{
		description: "Menus and side navigation for moving through an app.",
		href: "#site-navigation-heading",
		name: "Site navigation",
		status: "Patterns",
	},
	{
		description: "Search, sort, and compare budget records.",
		href: "#data-table-heading",
		name: "Budget table",
		status: "Data",
	},
] as const;

export function ListExamples() {
	return (
		<PreviewWorkspace
			testId="list-example"
			title="Project resources"
			titleId="list-heading"
		>
			<Stack gap="3">
				<div>
					<Text size="ui" tone="muted">
						A semantic list keeps each resource and its action distinct.
					</Text>
				</div>
				<div {...props(listCompositionStyles.resources)}>
					<List aria-label="Project resources">
						{resources.map((resource) => (
							<ListItem key={resource.name}>
								<ListContent>
									<Stack gap="1">
										<Text>
											<strong>
												<Link href={resource.href}>{resource.name}</Link>
											</strong>
										</Text>
										<Text size="ui" tone="muted">
											{resource.description}
										</Text>
									</Stack>
								</ListContent>
								<ListActions>
									<Inline>
										<Badge variant="secondary">{resource.status}</Badge>
									</Inline>
								</ListActions>
							</ListItem>
						))}
					</List>
				</div>
			</Stack>
		</PreviewWorkspace>
	);
}
