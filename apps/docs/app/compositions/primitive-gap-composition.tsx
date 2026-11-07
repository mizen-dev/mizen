import {
	Heading,
	Link,
	Meter,
	MeterIndicator,
	MeterLabel,
	MeterTrack,
	MeterValue,
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
	Stack,
	Text,
	VisuallyHidden,
} from "@mizen/ui";
import { PreviewWorkspace } from "../components/preview-workspace";

export function LinkExamples() {
	return (
		<PreviewWorkspace
			testId="link-example"
			title="Workspace resources"
			titleId="link-heading"
		>
			<Stack gap="2">
				<Text>
					Browse the <Link href="/docs">component index</Link> to find reusable
					patterns.
				</Text>
			</Stack>
		</PreviewWorkspace>
	);
}

export function VisuallyHiddenExamples() {
	return (
		<PreviewWorkspace
			testId="visually-hidden-example"
			title="Inbox"
			titleId="visually-hidden-heading"
		>
			<Stack gap="2">
				<Text data-testid="notification-count">
					Inbox: 4 <VisuallyHidden>unread notifications</VisuallyHidden>
				</Text>
			</Stack>
		</PreviewWorkspace>
	);
}

export function MeterExamples() {
	return (
		<PreviewWorkspace
			testId="meter-example"
			title="Storage usage"
			titleId="meter-heading"
		>
			<Stack gap="2">
				<Meter max={100} value={72}>
					<MeterLabel>Workspace storage</MeterLabel>
					<Stack gap="1">
						<MeterValue />
						<MeterTrack>
							<MeterIndicator />
						</MeterTrack>
					</Stack>
				</Meter>
				<PropertyList aria-label="Storage breakdown">
					<PropertyListItem>
						<PropertyListLabel>Documents</PropertyListLabel>
						<PropertyListValue>18 GB</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Media</PropertyListLabel>
						<PropertyListValue>46 GB</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Archives</PropertyListLabel>
						<PropertyListValue>8 GB</PropertyListValue>
					</PropertyListItem>
				</PropertyList>
				<Text size="ui" tone="muted">
					28 GB available on your workspace plan.
				</Text>
			</Stack>
		</PreviewWorkspace>
	);
}

export function PrimitiveGapComposition() {
	return (
		<Stack data-testid="primitive-gap-example" gap="4">
			<Heading level={2} size="title">
				Small primitives
			</Heading>
			<LinkExamples />
			<VisuallyHiddenExamples />
			<MeterExamples />
		</Stack>
	);
}
