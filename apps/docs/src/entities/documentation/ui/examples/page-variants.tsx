"use client";

import {
	Badge,
	BarList,
	Button,
	Card,
	CardDescription,
	CardHeader,
	CardPanel,
	CardTitle,
	Field,
	FieldDescription,
	FieldLabel,
	Grid,
	Inline,
	Input,
	MetricDelta,
	MetricTrend,
	Page,
	PageAction,
	PageDescription,
	PageHeader,
	PageTitle,
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
	Section,
	SectionAction,
	SectionDescription,
	SectionHeader,
	SectionTitle,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Text,
} from "@mizen-labs/ui";

const metrics = [
	{ change: 0.124, good: "up", label: "Revenue", value: "$48,290" },
	{ change: 0.031, good: "up", label: "New customers", value: "312" },
	{ change: -0.018, good: "up", label: "Conversion", value: "3.4%" },
	{ change: 0.08, good: "down", label: "Refunds", value: "$640" },
] as const;

const payments = [
	{ amount: "$1,200.00", customer: "Northstar Labs", status: "Paid" },
	{ amount: "$340.00", customer: "Maya Chen", status: "Paid" },
	{ amount: "$89.00", customer: "Alex Rivera", status: "Refunded" },
	{ amount: "$2,400.00", customer: "Harbor Studio", status: "Pending" },
];

const formatShare = (value: number) => `${value}%`;

export function PageDashboardExample1() {
	return (
		<Page>
			<PageHeader>
				<PageTitle>Overview</PageTitle>
				<PageDescription>How the business did this week.</PageDescription>
				<PageAction>
					<Button variant="outline">Export</Button>
				</PageAction>
			</PageHeader>
			<Section aria-labelledby="dashboard-week-title">
				<SectionHeader>
					<SectionTitle id="dashboard-week-title">This week</SectionTitle>
					<SectionDescription>Compared with last week.</SectionDescription>
				</SectionHeader>
				<Grid columns="4" gap="4">
					{metrics.map((metric) => (
						<MetricTrend
							delta={<MetricDelta good={metric.good} value={metric.change} />}
							deltaPlacement="footer"
							description="From last week"
							key={metric.label}
							label={metric.label}
							value={metric.value}
						/>
					))}
				</Grid>
			</Section>
			<Grid columns="2:1" gap="8">
				<Section aria-labelledby="dashboard-payments-title">
					<SectionHeader>
						<SectionTitle id="dashboard-payments-title">
							Recent payments
						</SectionTitle>
						<SectionAction>
							<Button size="sm" variant="ghost">
								View all
							</Button>
						</SectionAction>
					</SectionHeader>
					<TableContainer aria-label="Recent payments" scroll="horizontal">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead scope="col">Customer</TableHead>
									<TableHead scope="col">Status</TableHead>
									<TableHead numeric scope="col">
										Amount
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{payments.map((payment) => (
									<TableRow key={payment.customer}>
										<TableHead scope="row">{payment.customer}</TableHead>
										<TableCell>{payment.status}</TableCell>
										<TableCell numeric>{payment.amount}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Section>
				<Section aria-labelledby="dashboard-sources-title">
					<SectionHeader>
						<SectionTitle id="dashboard-sources-title">
							Where customers come from
						</SectionTitle>
					</SectionHeader>
					<BarList
						aria-label="Customers by source"
						formatValue={formatShare}
						items={[
							{ id: "search", label: "Search", value: 46 },
							{ id: "referral", label: "Referral", value: 31 },
							{ id: "direct", label: "Direct", value: 23 },
						]}
						valueLabel="Share"
					/>
				</Section>
			</Grid>
		</Page>
	);
}

const customers = [
	{ name: "Northstar Labs", plan: "Pro", seats: 24, status: "Active" },
	{ name: "Harbor Studio", plan: "Team", seats: 8, status: "Active" },
	{ name: "Maya Chen", plan: "Free", seats: 1, status: "Invited" },
	{ name: "Alex Rivera", plan: "Team", seats: 5, status: "Suspended" },
];

export function PageRecordListExample2() {
	return (
		<Page>
			<PageHeader>
				<PageTitle>Customers</PageTitle>
				<PageDescription>Everyone with access to a workspace.</PageDescription>
				<PageAction>
					<Button variant="brand">Add customer</Button>
				</PageAction>
			</PageHeader>
			<Section aria-labelledby="list-customers-title">
				<SectionHeader>
					<SectionTitle id="list-customers-title">All customers</SectionTitle>
					<SectionDescription>4 of 48 customers</SectionDescription>
					<SectionAction>
						<Input
							aria-label="Search customers"
							name="search"
							placeholder="Search customers…"
							type="search"
						/>
					</SectionAction>
				</SectionHeader>
				<TableContainer aria-label="Customers" scroll="horizontal">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead scope="col">Customer</TableHead>
								<TableHead scope="col">Plan</TableHead>
								<TableHead scope="col">Status</TableHead>
								<TableHead numeric scope="col">
									Seats
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{customers.map((customer) => (
								<TableRow key={customer.name}>
									<TableHead scope="row">{customer.name}</TableHead>
									<TableCell>{customer.plan}</TableCell>
									<TableCell>
										<Badge>{customer.status}</Badge>
									</TableCell>
									<TableCell numeric>{customer.seats}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Inline justify="between">
					<Text size="ui" tone="muted">
						Page 1 of 12
					</Text>
					<Inline gap="2">
						<Button disabled size="sm" variant="outline">
							Previous
						</Button>
						<Button size="sm" variant="outline">
							Next
						</Button>
					</Inline>
				</Inline>
			</Section>
		</Page>
	);
}

export function PageRecordDetailExample3() {
	return (
		<Page>
			<PageHeader>
				<PageTitle>Northstar Labs</PageTitle>
				<PageDescription>Customer since March 2024.</PageDescription>
				<PageAction>
					<Button variant="outline">Edit</Button>
					<Button variant="destructive-outline">Suspend</Button>
				</PageAction>
			</PageHeader>
			<Grid columns="2:1" gap="8">
				<Section aria-labelledby="detail-payments-title">
					<SectionHeader>
						<SectionTitle id="detail-payments-title">Payments</SectionTitle>
						<SectionDescription>The last three invoices.</SectionDescription>
					</SectionHeader>
					<TableContainer aria-label="Payments" scroll="horizontal">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead scope="col">Invoice</TableHead>
									<TableHead scope="col">Status</TableHead>
									<TableHead numeric scope="col">
										Amount
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableHead scope="row">November 2026</TableHead>
									<TableCell>Paid</TableCell>
									<TableCell numeric>$1,200.00</TableCell>
								</TableRow>
								<TableRow>
									<TableHead scope="row">October 2026</TableHead>
									<TableCell>Paid</TableCell>
									<TableCell numeric>$1,200.00</TableCell>
								</TableRow>
								<TableRow>
									<TableHead scope="row">September 2026</TableHead>
									<TableCell>Paid</TableCell>
									<TableCell numeric>$960.00</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Section>
				<Stack gap="4">
					<Card>
						<CardHeader>
							<CardTitle>Details</CardTitle>
						</CardHeader>
						<CardPanel>
							<PropertyList aria-label="Customer details">
								<PropertyListItem>
									<PropertyListLabel>Plan</PropertyListLabel>
									<PropertyListValue>Pro</PropertyListValue>
								</PropertyListItem>
								<PropertyListItem>
									<PropertyListLabel>Seats</PropertyListLabel>
									<PropertyListValue>24</PropertyListValue>
								</PropertyListItem>
								<PropertyListItem>
									<PropertyListLabel>Owner</PropertyListLabel>
									<PropertyListValue>Maya Chen</PropertyListValue>
								</PropertyListItem>
							</PropertyList>
						</CardPanel>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Renewal</CardTitle>
							<CardDescription>Renews on December 1, 2026.</CardDescription>
						</CardHeader>
					</Card>
				</Stack>
			</Grid>
		</Page>
	);
}

export function PageSettingsExample4() {
	return (
		<Page width="narrow">
			<PageHeader>
				<PageTitle>Workspace settings</PageTitle>
				<PageDescription>
					These settings apply to everyone in the workspace.
				</PageDescription>
			</PageHeader>
			<Section aria-labelledby="settings-general-title">
				<SectionHeader>
					<SectionTitle id="settings-general-title">General</SectionTitle>
				</SectionHeader>
				<Stack gap="4">
					<Field>
						<FieldLabel>Workspace name</FieldLabel>
						<Input defaultValue="Northstar" name="name" />
					</Field>
					<Field>
						<FieldLabel>Workspace address</FieldLabel>
						<Input defaultValue="northstar" name="slug" />
						<FieldDescription>
							People open the workspace at this address.
						</FieldDescription>
					</Field>
				</Stack>
			</Section>
			<Section aria-labelledby="settings-notifications-title">
				<SectionHeader>
					<SectionTitle id="settings-notifications-title">
						Notifications
					</SectionTitle>
					<SectionDescription>
						Choose what reaches your inbox.
					</SectionDescription>
				</SectionHeader>
				<Stack gap="2">
					<Field>
						<FieldLabel>
							<Switch defaultChecked name="mentions" />
							Mentions and replies
						</FieldLabel>
					</Field>
					<Field>
						<FieldLabel>
							<Switch name="summary" />
							Weekly summary
						</FieldLabel>
					</Field>
				</Stack>
			</Section>
			<Inline justify="end">
				<Button variant="ghost">Cancel</Button>
				<Button variant="brand">Save changes</Button>
			</Inline>
		</Page>
	);
}
