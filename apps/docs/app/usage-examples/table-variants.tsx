import {
	Heading,
	Stack,
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
	Text,
} from "@mizen-labs/ui";

const months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;
const budgetLines = [
	{ category: "Salaries", monthly: 860_000 },
	{ category: "Employer taxes", monthly: 258_000 },
	{ category: "Health and benefits", monthly: 75_000 },
	{ category: "Contractors", monthly: 190_000 },
	{ category: "Office rent", monthly: 245_000 },
	{ category: "Utilities", monthly: 28_000 },
	{ category: "Cloud infrastructure", monthly: 95_000 },
	{ category: "Software licenses", monthly: 62_000 },
	{ category: "Security tools", monthly: 22_000 },
	{ category: "Hardware refresh", monthly: 35_000 },
	{ category: "Research incentives", monthly: 40_000 },
	{ category: "Marketing campaigns", monthly: 95_000 },
	{ category: "Travel", monthly: 38_000 },
	{ category: "Training", monthly: 18_000 },
	{ category: "Legal services", monthly: 26_000 },
	{ category: "Accounting", monthly: 20_000 },
	{ category: "Insurance", monthly: 16_000 },
	{ category: "Payment fees", monthly: 12_000 },
	{ category: "Shipping", monthly: 5000 },
	{ category: "Recruiting", monthly: 24_000 },
	{ category: "Team events", monthly: 14_000 },
	{ category: "Office supplies", monthly: 9000 },
	{ category: "Accessibility audits", monthly: 18_000 },
	{ category: "Contingency reserve", monthly: 50_000 },
] as const;
const number = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 0,
});
const formatAmount = (amount: number) => number.format(amount);
const monthlyTotal = budgetLines.reduce(
	(total, line) => total + line.monthly,
	0
);
export function TableMonthlyOperatingBudgetExample1() {
	return (
		<Stack gap="3">
			<div>
				<Heading id="table-heading" level={2} size="title">
					Monthly operating budget
				</Heading>
				<Text size="ui" tone="muted">
					A 12-month budget with 24 recurring cost categories.
				</Text>
			</div>
			<TableContainer
				aria-label="2026 monthly operating budget by cost category"
				scroll="both"
			>
				<Table>
					<TableCaption>2026 planned monthly costs in USD.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead sticky>Cost category</TableHead>
							{months.map((month) => (
								<TableHead key={month} numeric>
									{month}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{budgetLines.map((line, index) => (
							<TableRow key={line.category}>
								<TableHead scope="row" sticky>
									{String(index + 1).padStart(2, "0")} {line.category}
								</TableHead>
								{months.map((month) => (
									<TableCell key={month} numeric>
										{formatAmount(line.monthly)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableHead scope="row" sticky>
								Total planned
							</TableHead>
							{months.map((month) => (
								<TableCell key={month} numeric>
									{formatAmount(monthlyTotal)}
								</TableCell>
							))}
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</Stack>
	);
}
