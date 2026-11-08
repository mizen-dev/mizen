export type AnalyticsEnvironment = "Production" | "Staging";

export interface AnalyticsRequestRecord {
	date: string;
	durationMs: number;
	environment: AnalyticsEnvironment;
	errors: number;
	requests: number;
	resource: string;
}

const resources = ["API Gateway", "Search Index", "Image Pipeline"] as const;
const environments: readonly AnalyticsEnvironment[] = ["Production", "Staging"];

export const analyticsDates = Array.from({ length: 14 }, (_, index) =>
	new Date(Date.UTC(2026, 8, 24 + index)).toISOString().slice(0, 10)
);

export const analyticsRecords: readonly AnalyticsRequestRecord[] =
	analyticsDates.flatMap((date, day) =>
		resources.flatMap((resource, resourceIndex) =>
			environments.map((environment, environmentIndex) => {
				const requests =
					18 + ((day * 7 + resourceIndex * 11 + environmentIndex * 5) % 39);
				let errors = 0;
				if ((day + resourceIndex + environmentIndex) % 4 === 0) {
					errors = 2;
				} else if ((day * 3 + resourceIndex) % 3 === 0) {
					errors = 1;
				}
				const meanRequestDurationMs =
					90 + ((day * 13 + resourceIndex * 37 + environmentIndex * 19) % 150);

				return {
					date,
					durationMs: requests * meanRequestDurationMs,
					environment,
					errors,
					requests,
					resource,
				};
			})
		)
	);

export const accountQuota = {
	max: 50_000,
	resetAt: "2026-10-14T16:30:00Z",
	snapshotAt: "2026-10-09",
	used: 43_200,
} as const;
