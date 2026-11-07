"use client";

import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
	Button,
	Stack,
} from "@mizen-labs/ui";
import {
	IconBell,
	IconCreditCard,
	IconShieldLock,
	IconUsers,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";

export function BasicAccordion() {
	return (
		<Accordion defaultValue={["notifications"]} variant="separated">
			<AccordionItem value="access">
				<AccordionTrigger icon={<IconUsers size={20} />}>
					Workspace access
				</AccordionTrigger>
				<AccordionPanel>
					Invite members and guests from workspace settings. Private projects
					stay visible only to the people you choose.
				</AccordionPanel>
			</AccordionItem>
			<AccordionItem value="notifications">
				<AccordionTrigger icon={<IconBell size={20} />}>
					Notifications
				</AccordionTrigger>
				<AccordionPanel>
					Choose which updates reach your inbox, and bundle the rest into a
					daily digest.
				</AccordionPanel>
			</AccordionItem>
			<AccordionItem value="billing">
				<AccordionTrigger icon={<IconCreditCard size={20} />}>
					Billing
				</AccordionTrigger>
				<AccordionPanel>
					Review your plan, update payment details, and download invoices from
					workspace settings.
				</AccordionPanel>
			</AccordionItem>
			<AccordionItem value="privacy">
				<AccordionTrigger icon={<IconShieldLock size={20} />}>
					Data and privacy
				</AccordionTrigger>
				<AccordionPanel>
					Manage sharing permissions and export your workspace data whenever you
					need it.
				</AccordionPanel>
			</AccordionItem>
		</Accordion>
	);
}

export function ControlledAccordion() {
	const [expanded, setExpanded] = useState<string[]>([]);
	const expandAll = useCallback(() => setExpanded(["access", "billing"]), []);
	return (
		<Stack>
			<Button onClick={expandAll} size="sm" variant="outline">
				Expand all
			</Button>
			<Accordion multiple onValueChange={setExpanded} value={expanded}>
				<AccordionItem value="access">
					<AccordionTrigger>Access</AccordionTrigger>
					<AccordionPanel>
						Invite people from workspace settings.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem value="billing">
					<AccordionTrigger>Billing</AccordionTrigger>
					<AccordionPanel>
						Invoices stay available after a plan change.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Stack>
	);
}
