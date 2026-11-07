import { Inline } from "@mizen-labs/ui/inline";
import { Stack } from "@mizen-labs/ui/stack";
import { StatusDot } from "@mizen-labs/ui/status-dot";
import { Text } from "@mizen-labs/ui/text";
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
