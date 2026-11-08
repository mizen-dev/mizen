import {
	Button,
	ErrorState,
	ErrorStateContent,
	ErrorStateDescription,
	ErrorStateHeader,
	ErrorStateMedia,
	ErrorStateTitle,
} from "@mizen-labs/ui";
import { IconAlertTriangle } from "@tabler/icons-react";

export function DashboardLoadFailure() {
	return (
		<ErrorState>
			<ErrorStateHeader>
				<ErrorStateMedia>
					<IconAlertTriangle aria-hidden="true" size="18" />
				</ErrorStateMedia>
				<ErrorStateTitle>Dashboard unavailable</ErrorStateTitle>
				<ErrorStateDescription>
					The latest metrics could not be loaded.
				</ErrorStateDescription>
			</ErrorStateHeader>
			<ErrorStateContent>
				<Button variant="outline">Try again</Button>
			</ErrorStateContent>
		</ErrorState>
	);
}
