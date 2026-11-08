import { Grid, MetricDelta, MetricTrend } from "@mizen-labs/ui";
import {
	IconCoin,
	IconMessageCircle,
	IconUserMinus,
	IconUsers,
} from "@tabler/icons-react";

export function SummaryGrid() {
	return (
		<Grid>
			<MetricTrend
				delta={<MetricDelta value={0.12} />}
				deltaPlacement="footer"
				description="From last month"
				icon={<IconCoin />}
				label="Revenue"
				value="48,200"
				valuePrefix="$"
			/>
			<MetricTrend
				delta={<MetricDelta value={0.04} />}
				deltaPlacement="footer"
				description="From last month"
				icon={<IconUsers />}
				label="Active users"
				value="3,140"
			/>
			<MetricTrend
				delta={<MetricDelta good="down" value={-0.12} />}
				deltaPlacement="footer"
				description="From last month"
				icon={<IconUserMinus />}
				label="Churn"
				value="1.8%"
			/>
			<MetricTrend
				delta={<MetricDelta good="down" value={0.08} />}
				deltaPlacement="footer"
				description="From last month"
				icon={<IconMessageCircle />}
				label="Open tickets"
				value="23"
			/>
		</Grid>
	);
}
