export const metrics = [
	{ change: 0.124, good: "up", label: "Revenue", value: "$48,290" },
	{ change: 0.031, good: "up", label: "New customers", value: "312" },
	{ change: -0.018, good: "up", label: "Conversion", value: "3.4%" },
	{ change: 0.08, good: "down", label: "Refunds", value: "$640" },
] as const;

// Each customer keeps one avatar color, so the same person looks the same on
// every screen.
export const orders = [
	{
		color: "blue",
		customer: "John Clarkson",
		id: "ORD-1042",
		initials: "JC",
		status: "Delivery failed",
		total: "$3,412.00",
		updated: "Sep 5",
		variant: "destructive",
	},
	{
		color: "purple",
		customer: "Aspen Lubin",
		id: "ORD-1043",
		initials: "AL",
		status: "Shipped",
		total: "$1,899.00",
		updated: "Mar 25",
		variant: "success",
	},
	{
		color: "green",
		customer: "Michael Ekstrom",
		id: "ORD-1044",
		initials: "ME",
		status: "Shipped",
		total: "$2,752.00",
		updated: "Aug 1",
		variant: "success",
	},
	{
		color: "orange",
		customer: "Kianna Vaccaro",
		id: "ORD-1045",
		initials: "KV",
		status: "Waiting",
		total: "$145.00",
		updated: "Apr 2",
		variant: "warning",
	},
	{
		color: "neutral",
		customer: "Livia Saris",
		id: "ORD-1046",
		initials: "LS",
		status: "Processing",
		total: "$708.00",
		updated: "Nov 14",
		variant: "info",
	},
	{
		color: "blue",
		customer: "Theo Martin",
		id: "ORD-1047",
		initials: "TM",
		status: "Shipped",
		total: "$1,240.00",
		updated: "Nov 12",
		variant: "success",
	},
	{
		color: "purple",
		customer: "Lina Park",
		id: "ORD-1048",
		initials: "LP",
		status: "Waiting",
		total: "$96.00",
		updated: "Nov 11",
		variant: "warning",
	},
] as const;

export type Order = (typeof orders)[number];

const monthly = (values: readonly number[]) =>
	values.map((value, month) => ({ time: Date.UTC(2026, month, 1), value }));

export const revenue = [
	{
		id: "online",
		label: "Online",
		points: monthly([31, 33, 35, 34, 38, 41, 43, 42, 46, 48, 47, 51]),
	},
	{
		id: "retail",
		label: "Retail",
		points: monthly([15, 16, 15, 17, 18, 18, 20, 21, 21, 23, 24, 25]),
	},
	{
		id: "partners",
		label: "Partners",
		points: monthly([9, 8, 11, 10, 12, 13, 12, 15, 15, 16, 17, 18]),
	},
];

const DAY = 86_400_000;
const firstDay = Date.UTC(2026, 6, 1);

export const ordersPerDay = Array.from({ length: 126 }, (_, index) => ({
	date: new Date(firstDay + index * DAY).toISOString().slice(0, 10),
	value: Math.round(
		Math.abs(Math.sin(index * 0.45) * 40 + Math.cos(index * 0.1) * 20)
	),
}));
