import { Inline } from "@mizen/ui/inline";
import { Stack } from "@mizen/ui/stack";
import { StatusDot } from "@mizen/ui/status-dot";
import { Text } from "@mizen/ui/text";
import { SpecimenSection } from "./specimen-section";

const statusSamples = [
	{ label: "Operational", variant: "success" },
	{ label: "Needs attention", variant: "warning" },
	{ label: "Unavailable", variant: "error" },
	{ label: "Mizen service", variant: "accent" },
	{ label: "Not connected", variant: "neutral" },
] as const;

export function StatusDotSpecimen() {
	return (
		<SpecimenSection primary title="Service states">
			<Text>Pair each fixed status dot with its visible meaning.</Text>
			<Stack>
				{statusSamples.map(({ label, variant }) => (
					<Inline key={variant}>
						<StatusDot aria-hidden="true" label={label} variant={variant} />
						<Text>{label}</Text>
					</Inline>
				))}
			</Stack>
		</SpecimenSection>
	);
}
