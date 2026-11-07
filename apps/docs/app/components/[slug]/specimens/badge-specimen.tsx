import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@mizen/ui";
import { Badge } from "@mizen/ui/badge";
import { Inline } from "@mizen/ui/inline";
import { Stack } from "@mizen/ui/stack";
import { SpecimenSection } from "./specimen-section";

const variantSamples = [
	{ label: "Queued", variant: "default" },
	{ label: "Failed", variant: "destructive" },
	{ label: "In review", variant: "info" },
	{ label: "Draft", variant: "outline" },
	{ label: "Archived", variant: "secondary" },
	{ label: "Synced", variant: "success" },
	{ label: "Needs review", variant: "warning" },
	{ label: "Featured", variant: "brand" },
] as const;

const sizeSamples = [
	{ label: "Unread", size: "sm" },
	{ label: "In progress", size: "default" },
	{ label: "Featured", size: "lg" },
] as const;

export function BadgeSpecimen() {
	return (
		<Stack gap="8">
			<Card>
				<CardHeader>
					<CardTitle>Autumn launch</CardTitle>
					<CardDescription>Product team · Release review</CardDescription>
					<CardAction>
						<Badge variant="info">In review</Badge>
					</CardAction>
				</CardHeader>
			</Card>
			<SpecimenSection
				description="Use badges to make compact status and category values scannable."
				title="Semantic variants"
			>
				<Inline>
					{variantSamples.map(({ label, variant }) => (
						<Badge key={variant} variant={variant}>
							{label}
						</Badge>
					))}
				</Inline>
			</SpecimenSection>
			<SpecimenSection title="Sizes">
				<Inline>
					{sizeSamples.map(({ label, size }) => (
						<Badge key={size} size={size}>
							{label}
						</Badge>
					))}
				</Inline>
			</SpecimenSection>
			<SpecimenSection
				description="Render a badge as a link when the status needs a destination."
				title="Polymorphic link"
			>
				<Inline>
					<Badge render={<a href="/components/status-dot" />}>
						Review status
					</Badge>
				</Inline>
			</SpecimenSection>
		</Stack>
	);
}
