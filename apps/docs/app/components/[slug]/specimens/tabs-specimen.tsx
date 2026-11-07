import {
	Badge,
	Field,
	FieldLabel,
	Heading,
	Input,
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
	Stack,
	Switch,
	Tabs,
	TabsIndicator,
	TabsList,
	TabsPanel,
	TabsTab,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function TabsSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Move between the project overview and activity."
				primary
				title="Project workspace"
			>
				<Tabs defaultValue="overview">
					<TabsList aria-label="Project views">
						<TabsTab value="overview">Overview</TabsTab>
						<TabsTab value="activity">Activity</TabsTab>
						<TabsTab disabled value="archive">
							Archive
						</TabsTab>
						<TabsIndicator />
					</TabsList>
					<TabsPanel value="overview">
						<Stack gap="4">
							<Heading level={4}>Project overview</Heading>
							<Text size="ui" tone="muted">
								Coordinate the autumn launch across product, support, and
								operations.
							</Text>
							<PropertyList aria-label="Project summary">
								<PropertyListItem>
									<PropertyListLabel>Owner</PropertyListLabel>
									<PropertyListValue>Maya Chen</PropertyListValue>
								</PropertyListItem>
								<PropertyListItem>
									<PropertyListLabel>Target date</PropertyListLabel>
									<PropertyListValue>October 28, 2026</PropertyListValue>
								</PropertyListItem>
								<PropertyListItem>
									<PropertyListLabel>Status</PropertyListLabel>
									<PropertyListValue>
										<Badge variant="info">In progress</Badge>
									</PropertyListValue>
								</PropertyListItem>
							</PropertyList>
						</Stack>
					</TabsPanel>
					<TabsPanel value="activity">
						<Stack gap="4">
							<Heading level={4}>Recent project activity</Heading>
							<Text>Maya updated the launch checklist.</Text>
							<Text size="ui" tone="muted">
								Today, 10:20 · Product team
							</Text>
							<Text>Alex completed the accessibility review.</Text>
							<Text size="ui" tone="muted">
								Yesterday, 16:45 · Design team
							</Text>
						</Stack>
					</TabsPanel>
					<TabsPanel value="archive">Archived project items</TabsPanel>
				</Tabs>
			</SpecimenSection>
			<SpecimenSection title="Record details">
				<Tabs defaultValue="details">
					<TabsList aria-label="Record sections" size="sm" variant="underline">
						<TabsTab value="details">Details</TabsTab>
						<TabsTab value="comments">Comments</TabsTab>
						<TabsIndicator />
					</TabsList>
					<TabsPanel value="details">
						<Stack gap="3">
							<Heading level={4}>Record details</Heading>
							<Text>Northstar launch · NSL-001</Text>
							<Text size="ui" tone="muted">
								Owned by Maya Chen. Updated today.
							</Text>
						</Stack>
					</TabsPanel>
					<TabsPanel value="comments">
						<Stack gap="3">
							<Heading level={4}>Record comments</Heading>
							<Text>The release checklist is ready for review.</Text>
							<Text size="ui" tone="muted">
								Maya Chen · Today, 10:20
							</Text>
						</Stack>
					</TabsPanel>
				</Tabs>
			</SpecimenSection>
			<SpecimenSection title="Account settings">
				<Tabs defaultValue="profile" orientation="vertical">
					<TabsList aria-label="Account sections" size="lg">
						<TabsTab value="profile">Profile</TabsTab>
						<TabsTab value="security">Security</TabsTab>
						<TabsIndicator />
					</TabsList>
					<TabsPanel value="profile">
						<Stack gap="4">
							<Heading level={4}>Profile settings</Heading>
							<Field>
								<FieldLabel>Display name</FieldLabel>
								<Input defaultValue="Maya Chen" />
							</Field>
							<Field>
								<FieldLabel>Contact email</FieldLabel>
								<Input defaultValue="maya@example.com" type="email" />
							</Field>
						</Stack>
					</TabsPanel>
					<TabsPanel value="security">
						<Stack gap="4">
							<Heading level={4}>Security settings</Heading>
							<Field>
								<FieldLabel>
									<Switch defaultChecked />
									Require a sign-in code
								</FieldLabel>
							</Field>
							<Text size="ui" tone="muted">
								Protect your workspace with a second verification step.
							</Text>
						</Stack>
					</TabsPanel>
				</Tabs>
			</SpecimenSection>
		</div>
	);
}
