import {
	Badge,
	Button,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Text,
} from "@mizen/ui";

export function ProjectCard() {
	return (
		<Card>
			<CardHeader>
				{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies the rendered heading text. */}
				<CardTitle render={<h3 />}>Pro plan</CardTitle>
				<CardDescription>$24 per seat, billed monthly</CardDescription>
				<CardAction>
					<Badge variant="success">Active</Badge>
				</CardAction>
			</CardHeader>
			<CardContent>
				<Text size="ui" tone="muted">
					8 of 10 seats used · Renews Nov 30
				</Text>
			</CardContent>
			<CardFooter>
				<Button size="sm">Manage plan</Button>
				<Button size="sm" variant="ghost">
					Add seats
				</Button>
			</CardFooter>
		</Card>
	);
}
