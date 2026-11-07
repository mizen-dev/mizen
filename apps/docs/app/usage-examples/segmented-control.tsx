import { SegmentedControl, SegmentedControlItem } from "@mizen-labs/ui";
export function BillingInterval() {
	return (
		<SegmentedControl aria-label="Billing interval" defaultValue={["monthly"]}>
			<SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
			<SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
		</SegmentedControl>
	);
}
