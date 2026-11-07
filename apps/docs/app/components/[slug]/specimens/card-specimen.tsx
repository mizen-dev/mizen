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
	CheckboxCard,
	darkTheme,
	Field,
	FieldLabel,
	Input,
	RadioCard,
	RadioGroup,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { SpecimenSection } from "./specimen-section";

export function CardSpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection
				canvas={false}
				description="Review production status and the checks required for a release."
				title="Release health"
			>
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
							Automated integration suites and security scans passed
							successfully.
						</Text>
					</CardContent>
					<CardFooter>
						<Button size="sm" variant="secondary">
							View pipeline
						</Button>
					</CardFooter>
				</Card>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Render Card as a native anchor when the entire surface navigates to a destination."
				title="Clickable navigation"
			>
				<Card
					data-testid="card-clickable"
					render={<a href="#card-native-destination" />}
				>
					<CardHeader>
						{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies accessible text to the rendered heading */}
						<CardTitle render={<h3 />}>Component documentation</CardTitle>
						<CardDescription render={<p />}>
							Explore design tokens, composition rules, and accessible
							primitives.
						</CardDescription>
					</CardHeader>
					<CardPanel>
						<Text>
							Read zero-choice defaults and slot styling across the system.
						</Text>
					</CardPanel>
				</Card>
			</SpecimenSection>

			<SpecimenSection
				description="Card owns structure while form-card controls own selection. Use dedicated form components for selectable item lists."
				title="Selectable presentations"
			>
				<CheckboxCard
					description="Receive weekly summaries and critical system alerts."
					label="Email notifications"
					name="card-specimen-notifications"
					value="email"
				/>
				<RadioGroup
					aria-label="Hosting tier"
					defaultValue="starter"
					name="card-specimen-plan"
				>
					<RadioCard
						description="Shared infrastructure with essential feature access."
						label="Starter plan"
						value="starter"
					/>
					<RadioCard
						description="Dedicated resources and priority incident response."
						label="Enterprise plan"
						value="enterprise"
					/>
				</RadioGroup>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Card surfaces and child typography adapt automatically when scoped under darkTheme."
				title="Dark theme composition"
			>
				<div
					data-testid="card-dark-theme"
					{...props(darkTheme as never, pageStyles.themePanel as never)}
				>
					<Card>
						<CardHeader>
							{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies accessible text to the rendered heading */}
							<CardTitle render={<h3 />}>Inverted environment</CardTitle>
							<CardDescription render={<p />}>
								Surface and content colors adjust to dark theme variables.
							</CardDescription>
						</CardHeader>
						<CardPanel>
							<Text>
								Theme scopes re-bind semantic tokens without modifying component
								internals.
							</Text>
							<Field>
								<FieldLabel>Theme preference</FieldLabel>
								<Input defaultValue="System" />
							</Field>
						</CardPanel>
					</Card>
				</div>
			</SpecimenSection>
		</Stack>
	);
}
