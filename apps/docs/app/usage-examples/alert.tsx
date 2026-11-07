import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@mizen-labs/ui";
import { IconAlertTriangle } from "@tabler/icons-react";

export function MaintenanceNotice() {
	return (
		<Alert variant="warning">
			<AlertIcon>
				<IconAlertTriangle aria-hidden="true" focusable="false" size="16" />
			</AlertIcon>
			<AlertTitle>Maintenance scheduled</AlertTitle>
			<AlertDescription>
				Routine infrastructure maintenance begins Sunday at 02:00 UTC.
			</AlertDescription>
		</Alert>
	);
}
