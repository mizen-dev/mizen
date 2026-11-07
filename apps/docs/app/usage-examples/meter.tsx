import {
	Inline,
	Meter,
	MeterIndicator,
	MeterLabel,
	MeterTrack,
	MeterValue,
	Spacer,
} from "@mizen/ui";

export function StorageCapacity() {
	return (
		<Meter max={100} value={72}>
			<Inline>
				<MeterLabel>Storage used</MeterLabel>
				<Spacer />
				<MeterValue />
			</Inline>
			<MeterTrack>
				<MeterIndicator />
			</MeterTrack>
		</Meter>
	);
}
