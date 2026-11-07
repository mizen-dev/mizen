"use client";
import { Button, Inline, Stack } from "@mizen/ui";
import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "@mizen/ui/accordion";
import { IconBell, IconUsers } from "@tabler/icons-react";
import { useCallback, useState } from "react";

export function AccordionWorkspacePreferencesExample1() {
	return (
		<Stack gap="4">
			<Accordion defaultValue={["general"]}>
				<AccordionItem value="general">
					<AccordionTrigger>General settings</AccordionTrigger>
					<AccordionPanel>
						Manage workspace identity, display language, and active timezone.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem value="notifications">
					<AccordionTrigger>Notification channels</AccordionTrigger>
					<AccordionPanel>
						Route delivery digests to email, webhooks, or mobile push tokens.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Stack>
	);
}
export function AccordionControlledMultipleExample2() {
	const [controlledValues, setControlledValues] = useState<string[]>([
		"network",
	]);
	const expandAll = useCallback(() => {
		setControlledValues(["network", "storage"]);
	}, []);
	const collapseAll = useCallback(() => {
		setControlledValues([]);
	}, []);
	return (
		<Stack gap="4">
			<Inline>
				<Button onClick={expandAll} size="sm" variant="secondary">
					Expand all
				</Button>
				<Button onClick={collapseAll} size="sm" variant="secondary">
					Collapse all
				</Button>
			</Inline>
			<Accordion
				multiple
				onValueChange={setControlledValues}
				value={controlledValues}
			>
				<AccordionItem value="network">
					<AccordionTrigger>Network configuration</AccordionTrigger>
					<AccordionPanel>
						Ingress proxies, firewall rules, and virtual private network peers.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem value="storage">
					<AccordionTrigger>Persistent storage</AccordionTrigger>
					<AccordionPanel>
						Mounted block volumes, snapshot schedules, and replication targets.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Stack>
	);
}
export function AccordionDisabledItemExample3() {
	return (
		<Stack gap="4">
			<Accordion defaultValue={["standard"]}>
				<AccordionItem value="standard">
					<AccordionTrigger>Standard telemetry</AccordionTrigger>
					<AccordionPanel>
						System CPU, memory utilization, and throughput counters.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem disabled value="audit">
					<AccordionTrigger>Restricted audit stream</AccordionTrigger>
					<AccordionPanel>
						Audit log streams require elevated security administrator
						privileges.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Stack>
	);
}
export function AccordionLongWrappingContentExample4() {
	return (
		<Stack gap="4">
			<Accordion defaultValue={["compliance"]}>
				<AccordionItem value="compliance">
					<AccordionTrigger>Compliance and data retention</AccordionTrigger>
					<AccordionPanel>
						All session operations, authentication handshakes, and access token
						grants undergo cryptographic signing and replicated indexing across
						multiple availability zones. Retained audit records stay immutably
						stored for ninety days to comply with enterprise compliance
						frameworks.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem value="privacy">
					<AccordionTrigger>Data privacy obligations</AccordionTrigger>
					<AccordionPanel>
						Personally identifiable information is redacted at the transport
						layer before telemetry storage. Access keys rotate automatically
						every thirty days.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Stack>
	);
}

export function AccordionRichHeadersExample() {
	return (
		<Accordion multiple variant="separated">
			<AccordionItem value="members">
				<AccordionTrigger
					description="Members and guest permissions"
					icon={<IconUsers size={20} />}
				>
					Workspace access
				</AccordionTrigger>
				<AccordionPanel>
					Invite teammates, choose their roles, and review who can see each
					project.
				</AccordionPanel>
			</AccordionItem>
			<AccordionItem value="updates">
				<AccordionTrigger
					description="Mentions, activity, and daily digests"
					icon={<IconBell size={20} />}
				>
					Notifications
				</AccordionTrigger>
				<AccordionPanel>
					Choose the updates you want to receive, then set a delivery schedule
					that suits your work.
				</AccordionPanel>
			</AccordionItem>
		</Accordion>
	);
}
