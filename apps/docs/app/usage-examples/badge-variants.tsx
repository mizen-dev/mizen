import { Badge } from "@mizen/ui/badge";
import { Inline } from "@mizen/ui/inline";
import { Stack } from "@mizen/ui/stack";

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
export function BadgeSemanticVariantsExample1() {
	return (
		<Stack gap="4">
			<Inline>
				{variantSamples.map(({ label, variant }) => (
					<Badge key={variant} variant={variant}>
						{label}
					</Badge>
				))}
			</Inline>
		</Stack>
	);
}
export function BadgeSizesExample2() {
	return (
		<Stack gap="4">
			<Inline>
				{sizeSamples.map(({ label, size }) => (
					<Badge key={size} size={size}>
						{label}
					</Badge>
				))}
			</Inline>
		</Stack>
	);
}
export function BadgePolymorphicLinkExample3() {
	return (
		<Stack gap="4">
			<Inline>
				<Badge render={<a href="/components/status-dot" />}>
					Review status
				</Badge>
			</Inline>
		</Stack>
	);
}
