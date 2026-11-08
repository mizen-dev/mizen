"use client";

import {
	AreaChart,
	Avatar,
	AvatarFallback,
	Badge,
	CategoryComparison,
	MetricDelta,
	MetricTrend,
	PartToWhole,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	TimeSeries,
} from "@mizen-labs/ui";
import { typeRoles } from "@mizen-labs/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import {
	IconArrowUpRight,
	IconChartBar,
	IconChartDonut,
	IconChartLine,
	IconUsers,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { landingStyles as s } from "./landing.styles";
import {
	accounts,
	compactMoney,
	type DashboardPeriod,
	dashboardData,
	money,
	number,
	periods,
} from "./landing-data";
import { PeriodSelect } from "./usage-examples/chart-controls";

function AccountsPreview() {
	return (
		<MetricTrend
			description="Sample accounts, independent of the reporting period."
			icon={<IconUsers />}
			label="A few of your customers"
		>
			<TableContainer aria-label="Sample customer accounts">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Customer</TableHead>
							<TableHead>Plan</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{accounts.map((account) => (
							<TableRow key={account.name}>
								<TableCell>
									<div {...props(s.account)}>
										<Avatar size="sm">
											<AvatarFallback>{account.initials}</AvatarFallback>
										</Avatar>
										<span>{account.name}</span>
									</div>
								</TableCell>
								<TableCell>{account.plan}</TableCell>
								<TableCell>
									<Badge
										size="sm"
										variant={
											account.status === "Active" ? "success" : "secondary"
										}
									>
										{account.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</MetricTrend>
	);
}

export function LandingPreview() {
	const [period, setPeriod] = useState<DashboardPeriod>("2026");
	const data = dashboardData(period);
	return (
		<section aria-label="Live analytics dashboard" {...props(s.dashboard)}>
			<div {...props(s.dashboardBar)}>
				<div {...props(s.workspace)}>
					<span {...props(s.workspaceMark)}>
						<IconChartBar aria-hidden="true" size={18} />
					</span>
					<strong>Northstar</strong>
					<span {...props(s.muted)}> / Analytics</span>
				</div>
				<Badge size="sm" variant="secondary">
					Sample workspace
				</Badge>
			</div>
			<div {...props(s.dashboardBody)}>
				<div {...props(s.dashboardHeading)}>
					<div>
						<h2 {...props(typeRoles.title)}>Business overview</h2>
						<p {...props(typeRoles.ui, s.supporting)}>
							Revenue, customers, and the channels behind your growth.
						</p>
					</div>
					<div {...props(s.period)}>
						<span {...props(typeRoles.ui, s.muted)}>January–June</span>
						<PeriodSelect
							label="Reporting year"
							onValueChange={setPeriod}
							options={periods}
							value={period}
						/>
					</div>
				</div>
				<section aria-label="Business metrics" {...props(s.metrics)}>
					{data.metrics.map((metric) => (
						<MetricTrend
							delta={<MetricDelta value={metric.delta} />}
							key={metric.label}
							label={metric.label}
							value={metric.value}
						>
							<TimeSeries
								aria-label={`${metric.label}, January to June ${period}`}
								points={metric.points}
								presentation="sparkline"
								seriesLabel={metric.label}
								timeZone="UTC"
								tone={metric.tone}
							/>
							<p {...props(typeRoles.caption)}>
								vs. January–June {Number(period) - 1}
							</p>
						</MetricTrend>
					))}
				</section>
				<div {...props(s.charts)}>
					<div {...props(s.revenue)}>
						<MetricTrend
							actions={
								<Link
									aria-label="Explore Area Chart"
									params={{ slug: "area-chart" }}
									to="/docs/components/$slug"
									{...props(s.textLink)}
								>
									<IconArrowUpRight aria-hidden="true" size={18} />
								</Link>
							}
							description={`Monthly revenue in USD · January–June ${period}`}
							icon={<IconChartLine />}
							label="Revenue over time"
							value={data.revenue}
						>
							<AreaChart
								aria-label={`Revenue by month, January to June ${period}`}
								formatAxisValue={compactMoney}
								formatValue={money}
								layout="stacked"
								series={data.series}
								timeZone="UTC"
							/>
						</MetricTrend>
					</div>
					<MetricTrend
						description={`Active customers by plan · June ${period}`}
						icon={<IconChartDonut />}
						label="A plan for every team"
					>
						<PartToWhole
							aria-label={`Customers by plan, June ${period}`}
							parts={data.plans}
							totalLabel="Customers"
						/>
					</MetricTrend>
					<MetricTrend
						description={`New customers by channel · January–June ${period}`}
						icon={<IconChartBar />}
						label="Where growth starts"
						value={number(data.newCustomers)}
					>
						<CategoryComparison
							aria-label={`New customers by acquisition channel, ${period}`}
							categories={data.channels}
							legend={false}
							seriesLabel="New customers"
							tone="series2"
							track
						/>
					</MetricTrend>
					<div {...props(s.accounts)}>
						<AccountsPreview />
					</div>
				</div>
			</div>
		</section>
	);
}
