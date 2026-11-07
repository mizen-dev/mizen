import { Group, Stack, Text } from "@mizen/ui";
import { IconCircleCheck, IconClock } from "@tabler/icons-react";

const checks = [
	[IconCircleCheck, "Build finished in 48s"],
	[IconCircleCheck, "214 tests passed"],
	[IconCircleCheck, "Preview deployed to staging"],
	[IconClock, "Rollout scheduled for 14:00"],
] as const;

export function DeploymentDetails() {
	return (
		<Stack gap="3">
			{checks.map(([Icon, text]) => (
				<Group key={text}>
					<Icon aria-hidden="true" size={16} />
					<Text size="ui">{text}</Text>
				</Group>
			))}
		</Stack>
	);
}
