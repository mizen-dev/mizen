import {
	Badge,
	Button,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
	Stack,
	Text,
} from "@mizen/ui";

export function CardReleaseHealthExample1() {
	return (
		<Stack gap="4">
			<Card data-testid="card-static">
				<CardHeader>
					{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies accessible text to the rendered heading */}
					<CardTitle render={<h3 id="card-native-destination" />}>
						Deployment pipeline
					</CardTitle>
					<CardDescription render={<p />}>
						Production release status and health checks.
					</CardDescription>
					<CardAction>
						<Badge variant="success">Active</Badge>
					</CardAction>
				</CardHeader>
				<CardContent>
					<Text>
						Automated integration suites and security scans passed successfully.
					</Text>
				</CardContent>
				<CardFooter>
					<Button size="sm" variant="secondary">
						View pipeline
					</Button>
				</CardFooter>
			</Card>
		</Stack>
	);
}
export function CardClickableNavigationExample2() {
	return (
		<Stack gap="4">
			<Card
				data-testid="card-clickable"
				render={<a href="#card-native-destination" />}
			>
				<CardHeader>
					{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies accessible text to the rendered heading */}
					<CardTitle render={<h3 />}>Component documentation</CardTitle>
					<CardDescription render={<p />}>
						Explore design tokens, composition rules, and accessible primitives.
					</CardDescription>
				</CardHeader>
				<CardPanel>
					<Text>
						Read zero-choice defaults and slot styling across the system.
					</Text>
				</CardPanel>
			</Card>
		</Stack>
	);
}
