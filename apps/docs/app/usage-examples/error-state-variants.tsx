"use client";
import {
	Badge,
	Button,
	Code,
	ErrorState,
	ErrorStateContent,
	ErrorStateDescription,
	ErrorStateHeader,
	ErrorStateMedia,
	ErrorStateTitle,
	Frame,
	FrameDescription,
	FrameHeader,
	FramePanel,
	FrameTitle,
	Grid,
	Heading,
	Inline,
	Stack,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import {
	IconAlertTriangle,
	IconRefresh,
	IconServerOff,
} from "@tabler/icons-react";
import { pageStyles } from "../page.styles";

function AlertTriangleIcon() {
	return <IconAlertTriangle aria-hidden="true" focusable={false} size="18" />;
}
function RefreshCwIcon() {
	return <IconRefresh aria-hidden="true" focusable={false} size="18" />;
}
function ServerCrashIcon() {
	return <IconServerOff aria-hidden="true" focusable={false} size="18" />;
}
export function ErrorStateCanonicalRetryExample1() {
	return (
		<Stack gap="4">
			<ErrorState>
				<ErrorStateHeader>
					<ErrorStateMedia>
						<AlertTriangleIcon />
					</ErrorStateMedia>
					<ErrorStateTitle>Failed to load dashboard</ErrorStateTitle>
					<ErrorStateDescription>
						An unexpected error occurred while fetching analytics. Please try
						again.
					</ErrorStateDescription>
				</ErrorStateHeader>
				<ErrorStateContent>
					<Button variant="brand">Try again</Button>
				</ErrorStateContent>
			</ErrorState>
		</Stack>
	);
}
export function ErrorStateComposedRecoveryActionsExample2() {
	return (
		<Stack gap="4">
			<ErrorState>
				<ErrorStateHeader>
					<ErrorStateMedia>
						<RefreshCwIcon />
					</ErrorStateMedia>
					<ErrorStateTitle>Connection interrupted</ErrorStateTitle>
					<ErrorStateDescription>
						Lost connection to the primary database replica. Check network
						settings or reconnect.
					</ErrorStateDescription>
				</ErrorStateHeader>
				<ErrorStateContent>
					<Grid>
						<Button variant="brand">Reconnect</Button>
						<Button variant="outline">Network diagnostics</Button>
					</Grid>
				</ErrorStateContent>
			</ErrorState>
		</Stack>
	);
}
export function ErrorStateDiagnosticDetailsExample3() {
	return (
		<Stack gap="4">
			<ErrorState>
				<ErrorStateHeader>
					<ErrorStateMedia>
						<ServerCrashIcon />
					</ErrorStateMedia>
					<ErrorStateTitle>Gateway timeout</ErrorStateTitle>
					<ErrorStateDescription>
						The upstream service did not respond within the configured timeout
						threshold.
					</ErrorStateDescription>
				</ErrorStateHeader>
				<ErrorStateContent>
					<Inline>
						<Badge variant="destructive">HTTP 504</Badge>
						<Code>GATEWAY_TIMEOUT_ERR</Code>
					</Inline>
					<Button variant="outline">Retry request</Button>
				</ErrorStateContent>
			</ErrorState>
		</Stack>
	);
}
export function ErrorStateFramedRegionExample4() {
	return (
		<Stack gap="4">
			<div
				data-testid="error-state-framed-region"
				{...props(pageStyles.themePanel as never)}
			>
				<Frame>
					<FrameHeader>
						<FrameTitle id="cluster-monitor-error">Cluster monitor</FrameTitle>
						<FrameDescription>
							Live cluster health status and alerts.
						</FrameDescription>
					</FrameHeader>
					<FramePanel>
						<ErrorState aria-labelledby="cluster-monitor-error" role="region">
							<ErrorStateHeader>
								<ErrorStateMedia>
									<AlertTriangleIcon />
								</ErrorStateMedia>
								<ErrorStateTitle>
									Cluster synchronization failed
								</ErrorStateTitle>
								<ErrorStateDescription>
									Node heartbeat timed out after three consecutive retries.
								</ErrorStateDescription>
							</ErrorStateHeader>
							<ErrorStateContent>
								<Button variant="destructive">Restart node</Button>
							</ErrorStateContent>
						</ErrorState>
					</FramePanel>
				</Frame>
			</div>
		</Stack>
	);
}
export function ErrorStateSemanticHeadingHierarchyExample5() {
	return (
		<Stack gap="4">
			<Heading level={3}>Service failure notice</Heading>
			<ErrorState>
				<ErrorStateHeader>
					<ErrorStateMedia>
						<AlertTriangleIcon />
					</ErrorStateMedia>
					<ErrorStateTitle level={4}>
						Payment processor unavailable
					</ErrorStateTitle>
					<ErrorStateDescription>
						Unable to reach the payment gateway. Invoices cannot be processed at
						this time.
					</ErrorStateDescription>
				</ErrorStateHeader>
				<ErrorStateContent>
					<Button variant="outline">Check service status</Button>
				</ErrorStateContent>
			</ErrorState>
		</Stack>
	);
}
