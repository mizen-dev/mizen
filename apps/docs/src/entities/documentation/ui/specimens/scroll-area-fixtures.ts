export interface AuditEntry {
	id: string;
	service: string;
	status: string;
	timestamp: string;
}

export interface ClusterNode {
	cpu: string;
	id: string;
	memory: string;
	region: string;
	status: string;
	type: string;
	uptime: string;
}

export interface DeploymentMatrixEntry {
	commit: string;
	env: string;
	latency: string;
	region: string;
	status: string;
	version: string;
}

export const verticalAuditEntries: readonly AuditEntry[] = [
	{
		id: "AUD-101",
		service: "auth-gateway",
		status: "200 OK",
		timestamp: "10:42:01",
	},
	{
		id: "AUD-102",
		service: "user-session",
		status: "200 OK",
		timestamp: "10:42:03",
	},
	{
		id: "AUD-103",
		service: "token-issuer",
		status: "201 Created",
		timestamp: "10:42:06",
	},
	{
		id: "AUD-104",
		service: "rate-limiter",
		status: "429 Too Many",
		timestamp: "10:42:09",
	},
	{
		id: "AUD-105",
		service: "api-router",
		status: "200 OK",
		timestamp: "10:42:12",
	},
	{
		id: "AUD-106",
		service: "telemetry-sink",
		status: "204 No Content",
		timestamp: "10:42:15",
	},
	{
		id: "AUD-107",
		service: "audit-indexer",
		status: "200 OK",
		timestamp: "10:42:18",
	},
];

export const horizontalClusterNodes: readonly ClusterNode[] = [
	{
		cpu: "14%",
		id: "node-us-east-1a",
		memory: "3.2 / 16 GB",
		region: "us-east-1",
		status: "Ready",
		type: "c6i.xlarge",
		uptime: "42d 11h",
	},
	{
		cpu: "28%",
		id: "node-us-east-1b",
		memory: "7.8 / 16 GB",
		region: "us-east-1",
		status: "Ready",
		type: "c6i.xlarge",
		uptime: "42d 11h",
	},
	{
		cpu: "52%",
		id: "node-us-west-2a",
		memory: "11.1 / 16 GB",
		region: "us-west-2",
		status: "Ready",
		type: "c6i.xlarge",
		uptime: "19d 04h",
	},
	{
		cpu: "19%",
		id: "node-eu-west-1a",
		memory: "4.5 / 16 GB",
		region: "eu-west-1",
		status: "Ready",
		type: "c6i.xlarge",
		uptime: "61d 22h",
	},
];

export const dualAxisDeployments: readonly DeploymentMatrixEntry[] = [
	{
		commit: "a4f91b",
		env: "production-us",
		latency: "18ms",
		region: "us-east-1",
		status: "Active",
		version: "v2.14.0",
	},
	{
		commit: "b8c02e",
		env: "staging-us",
		latency: "19ms",
		region: "us-east-2",
		status: "Testing",
		version: "v2.14.1-rc1",
	},
	{
		commit: "c7d31f",
		env: "canary-ap",
		latency: "31ms",
		region: "ap-southeast-1",
		status: "Evaluating",
		version: "v2.14.1-canary",
	},
	{
		commit: "e5a40d",
		env: "sandbox-internal",
		latency: "14ms",
		region: "us-west-1",
		status: "Syncing",
		version: "v2.15.0-dev",
	},
];

export const noOverflowEntries = [
	{
		description: "Production edge proxy routing operational",
		label: "Ingress healthy",
	},
	{
		description: "Zero rate limiting violations detected in the last hour",
		label: "Quotas stable",
	},
] as const;

export const securityAuditEntries: readonly AuditEntry[] = [
	{
		id: "SEC-901",
		service: "key-rotation",
		status: "Rotated",
		timestamp: "04:00:00",
	},
	{
		id: "SEC-902",
		service: "tls-handshake",
		status: "TLSv1.3",
		timestamp: "04:05:12",
	},
	{
		id: "SEC-903",
		service: "firewall-sync",
		status: "Rules verified",
		timestamp: "04:10:33",
	},
	{
		id: "SEC-904",
		service: "cert-renewal",
		status: "Valid (89d)",
		timestamp: "04:15:45",
	},
	{
		id: "SEC-905",
		service: "mTLS-tunnel",
		status: "Connected",
		timestamp: "04:20:01",
	},
	{
		id: "SEC-906",
		service: "token-revoke",
		status: "Revoked",
		timestamp: "04:25:10",
	},
	{
		id: "SEC-907",
		service: "auth-anomaly",
		status: "Quarantined",
		timestamp: "04:30:22",
	},
	{
		id: "SEC-908",
		service: "policy-sync",
		status: "Applied",
		timestamp: "04:35:55",
	},
];
