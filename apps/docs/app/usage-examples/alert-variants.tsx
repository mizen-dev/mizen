"use client";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Button,
	Stack,
} from "@mizen/ui";
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconCircleCheck,
	IconInfoCircle,
} from "@tabler/icons-react";

function InfoIcon() {
	return <IconInfoCircle aria-hidden="true" focusable="false" size="16" />;
}
function CheckCircleIcon() {
	return <IconCircleCheck aria-hidden="true" focusable="false" size="16" />;
}
function AlertTriangleIcon() {
	return <IconAlertTriangle aria-hidden="true" focusable="false" size="16" />;
}
function AlertCircleIcon() {
	return <IconAlertCircle aria-hidden="true" focusable="false" size="16" />;
}
export function AlertSemanticVariantsExample1() {
	return (
		<Stack gap="4">
			<Stack>
				<Alert variant="default">
					<AlertIcon>
						<InfoIcon />
					</AlertIcon>
					<AlertTitle>Default alert</AlertTitle>
					<AlertDescription>
						Standard operational feedback using surface and neutral content
						tokens.
					</AlertDescription>
				</Alert>

				<Alert variant="info">
					<AlertIcon>
						<InfoIcon />
					</AlertIcon>
					<AlertTitle>Information note</AlertTitle>
					<AlertDescription>
						Informational update with guidance on relevant system changes.
					</AlertDescription>
				</Alert>

				<Alert variant="success">
					<AlertIcon>
						<CheckCircleIcon />
					</AlertIcon>
					<AlertTitle>Deployment complete</AlertTitle>
					<AlertDescription>
						All services were updated successfully without downtime.
					</AlertDescription>
				</Alert>

				<Alert variant="warning">
					<AlertIcon>
						<AlertTriangleIcon />
					</AlertIcon>
					<AlertTitle>Storage threshold</AlertTitle>
					<AlertDescription>
						Database capacity has reached 85% utilization.
					</AlertDescription>
				</Alert>

				<Alert variant="error">
					<AlertIcon>
						<AlertCircleIcon />
					</AlertIcon>
					<AlertTitle>Connection failed</AlertTitle>
					<AlertDescription>
						Unable to establish connection to the remote cluster.
					</AlertDescription>
				</Alert>
			</Stack>
		</Stack>
	);
}
export function AlertInteractiveActionExample2() {
	return (
		<Stack gap="4">
			<Alert
				aria-labelledby="interactive-alert-heading"
				role="region"
				variant="default"
			>
				<AlertIcon>
					<InfoIcon />
				</AlertIcon>
				<AlertTitle id="interactive-alert-heading">Update available</AlertTitle>
				<AlertDescription>
					A new software release is ready to install. Review changelog before
					proceeding.
				</AlertDescription>
				<AlertAction>
					<Button size="sm" variant="outline">
						Update now
					</Button>
					<Button size="sm" variant="ghost">
						Details
					</Button>
				</AlertAction>
			</Alert>
		</Stack>
	);
}
export function AlertIconlessAlertExample3() {
	return (
		<Stack gap="4">
			<Alert variant="info">
				<AlertTitle>Maintenance scheduled</AlertTitle>
				<AlertDescription>
					Routine infrastructure maintenance begins Sunday at 02:00 UTC.
				</AlertDescription>
			</Alert>
		</Stack>
	);
}
export function AlertDescriptiononlyAlertExample4() {
	return (
		<Stack gap="4">
			<Alert variant="warning">
				<AlertIcon>
					<AlertTriangleIcon />
				</AlertIcon>
				<AlertDescription>
					Your session will expire in five minutes due to inactivity.
				</AlertDescription>
			</Alert>
		</Stack>
	);
}
