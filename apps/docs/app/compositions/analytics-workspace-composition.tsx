"use client";

import {
	Button,
	Card,
	CardPanel,
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
	ErrorState,
	ErrorStateContent,
	ErrorStateDescription,
	ErrorStateHeader,
	ErrorStateTitle,
	Field,
	FieldLabel,
	Heading,
	Input,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	Section,
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Skeleton,
	Stack,
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Text,
	TimeSeries,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import type {
	AnalyticsEnvironment,
	AnalyticsRequestRecord,
} from "./analytics-workspace.data";
import {
	accountQuota,
	analyticsDates,
	analyticsRecords,
} from "./analytics-workspace.data";
import { analyticsWorkspaceStyles } from "./analytics-workspace.styles";
import { compositionStyles } from "./composition.styles";
import { DemoDisclosure } from "./demo-disclosure";
import { UsageQuota } from "./usage-panel-composition";

type Period = "7" | "14";
type DataMode = "loaded" | "loading" | "error" | "empty";

const analyticsDateFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});

function formatRequestCount(value: number) {
	return value.toLocaleString("en-US");
}

function getPeriodDays(period: Period) {
	return period === "7" ? analyticsDates.slice(-7) : analyticsDates;
}

function formatErrorRate(value: number | null) {
	return value === null ? "—" : `${value.toFixed(2)}%`;
}

function formatLatency(value: number | null) {
	return value === null ? "—" : `${value.toFixed(0)} ms`;
}

function formatDateRange(first: string, last: string) {
	return `${analyticsDateFormatter.format(new Date(`${first}T12:00:00Z`))}–${analyticsDateFormatter.format(new Date(`${last}T12:00:00Z`))}`;
}

function hasReportFilters(period: Period, environment: string, search: string) {
	return period !== "14" || environment !== "all" || search.length > 0;
}

interface ResourceSummary {
	durationMs: number;
	environment: AnalyticsEnvironment;
	errors: number;
	requests: number;
	resource: string;
}

function summarizeResources(records: readonly AnalyticsRequestRecord[]) {
	const groups = new Map<string, ResourceSummary>();
	for (const record of records) {
		const key = `${record.resource}:${record.environment}`;
		const summary = groups.get(key) ?? {
			durationMs: 0,
			environment: record.environment,
			errors: 0,
			requests: 0,
			resource: record.resource,
		};
		summary.errors += record.errors;
		summary.requests += record.requests;
		summary.durationMs += record.durationMs;
		groups.set(key, summary);
	}
	return [...groups.values()].sort(
		(left, right) =>
			left.resource.localeCompare(right.resource) ||
			left.environment.localeCompare(right.environment)
	);
}

function QuotaAside() {
	return (
		<aside aria-labelledby="analytics-workspace-quota-heading">
			<Card>
				<CardPanel>
					<Stack gap="3">
						<div>
							<Heading
								id="analytics-workspace-quota-heading"
								level={3}
								size="heading"
							>
								Account usage
							</Heading>
							<Text size="ui" tone="muted">
								Account-wide allowance; report filters do not apply.
							</Text>
						</div>
						<UsageQuota
							label="Weekly credits"
							max={accountQuota.max}
							unit="credits"
							used={accountQuota.used}
						/>
						<Text size="ui" tone="muted">
							Period: 7–14 October 2026 · Snapshot:{" "}
							<time dateTime={accountQuota.snapshotAt}>9 October 2026</time>
						</Text>
						<Text size="ui" tone="muted">
							Resets{" "}
							<time dateTime={accountQuota.resetAt}>
								14 October 2026 at 16:30 UTC
							</time>
						</Text>
					</Stack>
				</CardPanel>
			</Card>
		</aside>
	);
}

function AnalyticsStatePreview({
	mode,
	onRetry,
}: {
	mode: Exclude<DataMode, "loaded">;
	onRetry: () => void;
}) {
	if (mode === "loading") {
		return (
			<div
				aria-busy="true"
				aria-label="Loading analytics preview"
				role="status"
			>
				<Card>
					<CardPanel>
						<Stack gap="3">
							<div>
								<Skeleton />
								<Skeleton />
							</div>
							<Skeleton shape="rectangle" />
						</Stack>
					</CardPanel>
				</Card>
			</div>
		);
	}
	if (mode === "error") {
		return (
			<ErrorState aria-labelledby="analytics-error-title" role="region">
				<ErrorStateHeader>
					<ErrorStateTitle id="analytics-error-title">
						Could not load analytics
					</ErrorStateTitle>
					<ErrorStateDescription>
						The report could not load. Your filters are preserved.
					</ErrorStateDescription>
				</ErrorStateHeader>
				<ErrorStateContent>
					<Button onClick={onRetry} variant="brand">
						Retry
					</Button>
				</ErrorStateContent>
			</ErrorState>
		);
	}
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No analytics records</EmptyTitle>
				<EmptyDescription>
					No records are available for this report.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function AnalyticsPreviewControls({
	options,
	value,
	onValueChange,
}: {
	options?: { showExamples?: boolean };
	value: DataMode;
	onValueChange: (value: DataMode | null) => void;
}) {
	if (!options?.showExamples) {
		return null;
	}
	return (
		<DemoDisclosure title="Data state">
			<Field>
				<FieldLabel>Preview state</FieldLabel>
				<Select<DataMode>
					data-testid="analytics-workspace-data-mode"
					onValueChange={onValueChange}
					value={value}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectPopup>
						<SelectItem value="loaded">Loaded</SelectItem>
						<SelectItem value="loading">Loading</SelectItem>
						<SelectItem value="error">Error</SelectItem>
						<SelectItem value="empty">Empty collection</SelectItem>
					</SelectPopup>
				</Select>
			</Field>
		</DemoDisclosure>
	);
}

export function AnalyticsWorkspaceExamples(options?: {
	showExamples?: boolean;
}) {
	const [period, setPeriod] = useState<Period>("14");
	const [dataMode, setDataMode] = useState<DataMode>("loaded");
	const [environment, setEnvironment] = useState("all");
	const [search, setSearch] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);
	const environmentLabel =
		environment === "all" ? "All environments" : environment;
	const changePeriod = useCallback((value: Period | null) => {
		if (value === "7" || value === "14") {
			setPeriod(value);
		}
	}, []);
	const changeDataMode = useCallback((value: DataMode | null) => {
		if (value) {
			setDataMode(value);
		}
	}, []);
	const changeEnvironment = useCallback((value: string | null) => {
		setEnvironment(value ?? "all");
	}, []);
	const changeSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.currentTarget.value);
	}, []);
	const clearFilters = useCallback(() => {
		setPeriod("14");
		setEnvironment("all");
		setSearch("");
		searchInputRef.current?.focus();
	}, []);
	const retryPreview = useCallback(() => setDataMode("loaded"), []);
	const days = getPeriodDays(period);
	const periodDays = new Set(days);
	const normalizedSearch = search.trim().toLocaleLowerCase("en-US");
	const filteredRecords = analyticsRecords.filter(
		(record) =>
			periodDays.has(record.date) &&
			(environment === "all" || record.environment === environment) &&
			record.resource.toLocaleLowerCase("en-US").includes(normalizedSearch)
	);
	const totals = filteredRecords.reduce(
		(summary, record) => ({
			durationMs: summary.durationMs + record.durationMs,
			errors: summary.errors + record.errors,
			requests: summary.requests + record.requests,
		}),
		{ durationMs: 0, errors: 0, requests: 0 }
	);
	const rows = summarizeResources(filteredRecords);
	const trend = days.map((date) => ({
		time: Date.parse(`${date}T00:00:00Z`),
		value:
			filteredRecords.length === 0
				? null
				: filteredRecords
						.filter((record) => record.date === date)
						.reduce((sum, record) => sum + record.requests, 0),
	}));
	const errorRate =
		totals.requests === 0 ? null : (totals.errors / totals.requests) * 100;
	const averageLatency =
		totals.requests === 0 ? null : totals.durationMs / totals.requests;
	const hasFilters = hasReportFilters(period, environment, search);
	const lastDay = days.at(-1);

	return (
		<div {...props(compositionStyles.workspace)}>
			<Section
				aria-labelledby="analytics-workspace-heading"
				data-testid="analytics-workspace-example"
			>
				<Stack gap="8">
					<div {...props(compositionStyles.intro)}>
						<Heading id="analytics-workspace-heading" level={2} size="title">
							API usage
						</Heading>
						<p {...props(compositionStyles.sectionDescription)}>
							Request volume, errors, and mean latency by resource.
						</p>
					</div>

					<div {...props(analyticsWorkspaceStyles.controls)}>
						<Field>
							<FieldLabel>Report period</FieldLabel>
							<Select<Period>
								data-testid="analytics-workspace-period"
								disabled={dataMode !== "loaded"}
								onValueChange={changePeriod}
								value={period}
							>
								<SelectTrigger aria-label="Report period">
									<SelectValue>
										{period === "7" ? "Last 7 days" : "Last 14 days"}
									</SelectValue>
								</SelectTrigger>
								<SelectPopup>
									<SelectItem value="7">Last 7 days</SelectItem>
									<SelectItem value="14">Last 14 days</SelectItem>
								</SelectPopup>
							</Select>
						</Field>
						<Field>
							<FieldLabel>Environment</FieldLabel>
							<Select<string>
								data-testid="analytics-workspace-environment"
								disabled={dataMode !== "loaded"}
								onValueChange={changeEnvironment}
								value={environment}
							>
								<SelectTrigger aria-label="Environment">
									<SelectValue>{environmentLabel}</SelectValue>
								</SelectTrigger>
								<SelectPopup>
									<SelectItem value="all">All environments</SelectItem>
									<SelectItem value="Production">Production</SelectItem>
									<SelectItem value="Staging">Staging</SelectItem>
								</SelectPopup>
							</Select>
						</Field>
						<div {...props(analyticsWorkspaceStyles.searchRow)}>
							<Field>
								<FieldLabel>Search resources</FieldLabel>
								<Input
									data-testid="analytics-workspace-search"
									disabled={dataMode !== "loaded"}
									onChange={changeSearch}
									placeholder="Filter by resource"
									ref={searchInputRef}
									value={search}
								/>
							</Field>
							<Button
								data-testid="analytics-workspace-clear-filters"
								disabled={!hasFilters || dataMode !== "loaded"}
								onClick={clearFilters}
								variant="ghost"
							>
								Clear filters
							</Button>
						</div>
					</div>

					{dataMode === "loaded" && (
						<>
							<div {...props(analyticsWorkspaceStyles.metricRow)}>
								<Metric>
									<MetricLabel>Total requests</MetricLabel>
									<MetricValue data-testid="analytics-workspace-total-requests">
										{totals.requests.toLocaleString("en-US")}
									</MetricValue>
								</Metric>
								<Metric>
									<MetricLabel>Errors</MetricLabel>
									<MetricValue data-testid="analytics-workspace-total-errors">
										{totals.errors.toLocaleString("en-US")}
									</MetricValue>
								</Metric>
								<Metric>
									<MetricLabel>Error rate</MetricLabel>
									<MetricValue data-testid="analytics-workspace-error-rate">
										{formatErrorRate(errorRate)}
									</MetricValue>
									<MetricDescription>Errors ÷ requests</MetricDescription>
								</Metric>
								<Metric>
									<MetricLabel>Mean latency</MetricLabel>
									<MetricValue data-testid="analytics-workspace-mean-latency">
										{formatLatency(averageLatency)}
									</MetricValue>
								</Metric>
							</div>

							<div {...props(analyticsWorkspaceStyles.workareas)}>
								<Card>
									<CardPanel>
										<Stack gap="3">
											<div>
												<Heading level={3} size="heading">
													Requests over time
												</Heading>
												<Text size="ui" tone="muted">
													Daily requests ·{" "}
													{formatDateRange(days[0], lastDay ?? days[0])} · UTC
												</Text>
											</div>
											<div data-testid="analytics-workspace-trend">
												<TimeSeries
													aria-description="Daily request totals for the selected report period, environment, and resource search."
													aria-label="Daily API requests"
													formatValue={formatRequestCount}
													points={trend}
													seriesLabel="Requests"
													timeZone="UTC"
												/>
											</div>
										</Stack>
									</CardPanel>
								</Card>
								<QuotaAside />
							</div>

							<div>
								<Stack gap="2">
									<div>
										<Heading level={3} size="heading">
											Resource activity
										</Heading>
										<Text aria-live="polite" size="ui" tone="muted">
											{rows.length} resource groups
										</Text>
									</div>
									{rows.length > 0 ? (
										<TableContainer aria-label="Resource activity records">
											<Table>
												<TableCaption>
													Requests, errors, and mean latency by resource.
												</TableCaption>
												<TableHeader>
													<TableRow>
														<TableHead>Resource</TableHead>
														<TableHead>Environment</TableHead>
														<TableHead numeric>Requests</TableHead>
														<TableHead numeric>Errors</TableHead>
														<TableHead numeric>Mean latency</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{rows.map((row) => (
														<TableRow
															key={`${row.resource}-${row.environment}`}
														>
															<TableHead scope="row">{row.resource}</TableHead>
															<TableCell>{row.environment}</TableCell>
															<TableCell numeric>
																{row.requests.toLocaleString("en-US")}
															</TableCell>
															<TableCell numeric>
																{row.errors.toLocaleString("en-US")}
															</TableCell>
															<TableCell numeric>
																{(row.durationMs / row.requests).toFixed(0)} ms
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									) : (
										<Empty>
											<EmptyHeader>
												<EmptyTitle>No matching records</EmptyTitle>
												<EmptyDescription>
													No API records match the current environment and
													resource search.
												</EmptyDescription>
											</EmptyHeader>
										</Empty>
									)}
								</Stack>
							</div>
						</>
					)}
					{dataMode !== "loaded" && (
						<div {...props(analyticsWorkspaceStyles.workareas)}>
							<AnalyticsStatePreview mode={dataMode} onRetry={retryPreview} />
							<QuotaAside />
						</div>
					)}
					<AnalyticsPreviewControls
						onValueChange={changeDataMode}
						options={options}
						value={dataMode}
					/>
				</Stack>
			</Section>
		</div>
	);
}
