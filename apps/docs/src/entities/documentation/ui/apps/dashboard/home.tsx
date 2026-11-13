"use client";

import {
	AreaChart,
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	CalendarHeatmap,
	Checkbox,
	Grid,
	Inline,
	MetricDelta,
	MetricTrend,
	Page,
	PageAction,
	PageDescription,
	PageHeader,
	PageTitle,
	Section,
	SectionAction,
	SectionHeader,
	SectionTitle,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@mizen-labs/ui";
import { useCallback, useState } from "react";
import { metrics, type Order, orders, ordersPerDay, revenue } from "./data";

function OrderRow({
	onToggle,
	order,
	selected,
}: {
	onToggle: (id: string) => void;
	order: Order;
	selected: boolean;
}) {
	const toggle = useCallback(() => onToggle(order.id), [onToggle, order.id]);
	return (
		<TableRow selected={selected}>
			<TableCell>
				<Checkbox
					aria-label={`Select ${order.id}, ${order.customer}`}
					checked={selected}
					onCheckedChange={toggle}
				/>
			</TableCell>
			<TableHead scope="row">
				<Inline gap="2" wrap={false}>
					<Avatar size="sm">
						<AvatarFallback color={order.color}>
							{order.initials}
						</AvatarFallback>
					</Avatar>
					{order.customer}
				</Inline>
			</TableHead>
			<TableCell>
				<Badge appearance="soft" variant={order.variant}>
					{order.status}
				</Badge>
			</TableCell>
			<TableCell>{order.updated}</TableCell>
			<TableCell numeric>{order.total}</TableCell>
		</TableRow>
	);
}

function RecentOrders() {
	const [selected, setSelected] = useState<readonly string[]>([
		"ORD-1043",
		"ORD-1044",
	]);
	const toggle = useCallback(
		(id: string) =>
			setSelected((current) =>
				current.includes(id)
					? current.filter((entry) => entry !== id)
					: [...current, id]
			),
		[]
	);
	const all = selected.length === orders.length;
	const toggleAll = useCallback(
		() => setSelected(all ? [] : orders.map((order) => order.id)),
		[all]
	);
	return (
		<Section aria-labelledby="orders-title">
			<SectionHeader>
				<SectionTitle id="orders-title">Recent orders</SectionTitle>
				<SectionAction>
					<Button size="sm" variant="ghost">
						View all
					</Button>
				</SectionAction>
			</SectionHeader>
			<TableContainer aria-labelledby="orders-title" scroll="horizontal">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead scope="col">
								<Checkbox
									aria-label="Select all orders"
									checked={all}
									indeterminate={selected.length > 0 && !all}
									onCheckedChange={toggleAll}
								/>
							</TableHead>
							<TableHead scope="col">Customer</TableHead>
							<TableHead scope="col">Status</TableHead>
							<TableHead scope="col">Updated</TableHead>
							<TableHead numeric scope="col">
								Total
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map((order) => (
							<OrderRow
								key={order.id}
								onToggle={toggle}
								order={order}
								selected={selected.includes(order.id)}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Section>
	);
}

// One screen: a Page with its header, then sections. The layout comes from
// Page, Section, Grid and Stack; the screen has no CSS of its own.
export function Home() {
	return (
		<Page>
			<PageHeader>
				<PageTitle>Home</PageTitle>
				<PageDescription>How the business did this week.</PageDescription>
				<PageAction>
					<Button variant="outline">Export</Button>
					<Button>New order</Button>
				</PageAction>
			</PageHeader>
			<Grid columns="4" gap="4">
				{metrics.map((metric) => (
					<MetricTrend
						delta={
							<MetricDelta
								appearance="soft"
								good={metric.good}
								value={metric.change}
							/>
						}
						deltaPlacement="footer"
						description="From last week"
						key={metric.label}
						label={metric.label}
						value={metric.value}
					/>
				))}
			</Grid>
			<Grid columns="2:1" gap="8">
				<RecentOrders />
				<Stack gap="8">
					<Section aria-labelledby="revenue-title">
						<SectionHeader>
							<SectionTitle id="revenue-title">Revenue by channel</SectionTitle>
						</SectionHeader>
						<AreaChart
							aria-label="Revenue by channel"
							layout="overlap"
							series={revenue}
							timeZone="UTC"
						/>
					</Section>
					<Section aria-labelledby="activity-title">
						<SectionHeader>
							<SectionTitle id="activity-title">Orders per day</SectionTitle>
						</SectionHeader>
						<CalendarHeatmap
							aria-label="Orders per day"
							days={ordersPerDay}
							tone="series1"
							valueLabel="Orders"
							weekStartsOn={0}
						/>
					</Section>
				</Stack>
			</Grid>
		</Page>
	);
}
