// Fictional six-month business snapshots. Every card reads the selected year.
const snapshots = {
	2024: {
		customers: [620, 674, 728, 790, 845, 920],
		newRevenue: [4000, 5000, 4500, 6500, 8000, 11_000],
		orders: [220, 240, 260, 300, 330, 400],
		renewalRevenue: [8000, 9000, 8500, 11_500, 14_000, 18_000],
	},
	2025: {
		customers: [720, 790, 856, 920, 988, 1056],
		newRevenue: [5200, 6300, 5700, 8000, 9400, 11_500],
		orders: [240, 278, 260, 340, 386, 460],
		renewalRevenue: [9600, 10_900, 10_400, 12_900, 14_400, 17_200],
	},
	2026: {
		customers: [850, 920, 1015, 1102, 1186, 1284],
		newRevenue: [7200, 9400, 8100, 12_300, 14_500, 17_350],
		orders: [290, 325, 348, 410, 478, 535],
		renewalRevenue: [11_040, 12_700, 12_700, 16_300, 17_900, 21_400],
	},
};

export const periods = ["2026", "2025"] as const;
export type DashboardPeriod = (typeof periods)[number];
export const money = (value: number) =>
	new Intl.NumberFormat("en-US", {
		currency: "USD",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);
export const compactMoney = (value: number) =>
	new Intl.NumberFormat("en-US", {
		currency: "USD",
		maximumFractionDigits: 1,
		notation: "compact",
		style: "currency",
	}).format(value);
export const number = (value: number) =>
	new Intl.NumberFormat("en-US").format(value);
const sum = (values: readonly number[]) =>
	values.reduce((total, value) => total + value, 0);
const points = (values: readonly number[], year: number) =>
	values.map((value, month) => ({ time: Date.UTC(year, month, 1), value }));

function totals(snapshot: (typeof snapshots)[2026]) {
	const revenue = snapshot.newRevenue.map(
		(value, index) => value + snapshot.renewalRevenue[index]
	);
	return {
		customers: snapshot.customers[5],
		orders: sum(snapshot.orders),
		orderValue: sum(revenue) / sum(snapshot.orders),
		revenue: sum(revenue),
		trend: revenue,
	};
}

const plans = {
	2025: [516, 420, 120],
	2026: [764, 388, 132],
};
const channels = {
	2025: [138, 91, 68, 39],
	2026: [184, 112, 86, 52],
};

export function dashboardData(period: DashboardPeriod) {
	const current = snapshots[period];
	const previous = period === "2026" ? snapshots[2025] : snapshots[2024];
	const values = totals(current);
	const before = totals(previous);
	return {
		channels: ["Organic", "Direct", "Referral", "Paid"].map((label, index) => ({
			id: label,
			label,
			value: channels[period][index],
		})),
		metrics: [
			{
				delta: values.revenue / before.revenue - 1,
				label: "Total revenue",
				points: points(values.trend, Number(period)),
				tone: "series1" as const,
				value: money(values.revenue),
			},
			{
				delta: values.customers / before.customers - 1,
				label: "Active customers",
				points: points(current.customers, Number(period)),
				tone: "series2" as const,
				value: number(values.customers),
			},
			{
				delta: values.orders / before.orders - 1,
				label: "Orders",
				points: points(current.orders, Number(period)),
				tone: "series3" as const,
				value: number(values.orders),
			},
			{
				delta: values.orderValue / before.orderValue - 1,
				label: "Average order",
				points: points(
					values.trend.map((value, index) => value / current.orders[index]),
					Number(period)
				),
				tone: "series4" as const,
				value: money(values.orderValue),
			},
		],
		newCustomers: sum(channels[period]),
		plans: ["Pro", "Team", "Enterprise"].map((label, index) => ({
			id: label,
			label,
			value: plans[period][index],
		})),
		revenue: money(values.revenue),
		series: [
			{
				id: "renewals",
				label: "Renewals",
				points: points(current.renewalRevenue, Number(period)),
				tone: "series1" as const,
			},
			{
				id: "new",
				label: "New subscriptions",
				points: points(current.newRevenue, Number(period)),
				tone: "series2" as const,
			},
		],
	};
}

export const accounts = [
	{ initials: "LS", name: "Layers Studio", plan: "Team", status: "Active" },
	{
		initials: "OC",
		name: "Orbit Commerce",
		plan: "Enterprise",
		status: "Active",
	},
	{ initials: "FF", name: "Forma Foundry", plan: "Pro", status: "Trial" },
	{ initials: "AL", name: "Arc Labs", plan: "Team", status: "Active" },
	{ initials: "NP", name: "Nimbus Press", plan: "Pro", status: "Active" },
	{
		initials: "HW",
		name: "Harbor Works",
		plan: "Enterprise",
		status: "Active",
	},
	{ initials: "QK", name: "Quill Kitchen", plan: "Pro", status: "Trial" },
	{ initials: "TM", name: "Tidal Maps", plan: "Team", status: "Active" },
];
