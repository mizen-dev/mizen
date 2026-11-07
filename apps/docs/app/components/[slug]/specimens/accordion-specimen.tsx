"use client";

import { Button, darkTheme, Inline, Stack } from "@mizen/ui";
import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "@mizen/ui/accordion";
import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { pageStyles } from "../../../page.styles";
import { SpecimenSection } from "./specimen-section";

export function AccordionSpecimen() {
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
		<Stack gap="8">
			<SpecimenSection
				description="Review how your workspace is organized and where updates are delivered."
				primary
				title="Workspace preferences"
			>
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
			</SpecimenSection>

			<SpecimenSection
				description="Coordinates multiple expanded panels through external state and actions."
				title="Controlled multiple"
			>
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
							Ingress proxies, firewall rules, and virtual private network
							peers.
						</AccordionPanel>
					</AccordionItem>
					<AccordionItem value="storage">
						<AccordionTrigger>Persistent storage</AccordionTrigger>
						<AccordionPanel>
							Mounted block volumes, snapshot schedules, and replication
							targets.
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			</SpecimenSection>

			<SpecimenSection
				description="Suppresses user interaction on restricted or unavailable sections."
				title="Disabled item"
			>
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
			</SpecimenSection>

			<SpecimenSection
				description="Preserves layout structure and text wrapping across responsive viewports."
				title="Long wrapping content"
			>
				<Accordion defaultValue={["compliance"]}>
					<AccordionItem value="compliance">
						<AccordionTrigger>Compliance and data retention</AccordionTrigger>
						<AccordionPanel>
							All session operations, authentication handshakes, and access
							token grants undergo cryptographic signing and replicated indexing
							across multiple availability zones. Retained audit records stay
							immutably stored for ninety days to comply with enterprise
							compliance frameworks.
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
			</SpecimenSection>

			<SpecimenSection
				description="Adapts accordion borders, triggers, and typography in the dark theme."
				title="Dark theme composition"
			>
				<div
					data-testid="accordion-dark-theme"
					{...props(darkTheme, pageStyles.themePanel)}
				>
					<Accordion defaultValue={["security"]}>
						<AccordionItem value="security">
							<AccordionTrigger>Security credentials</AccordionTrigger>
							<AccordionPanel>
								Mutual TLS termination and strict transport security active
								across all ingress endpoints.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="tokens">
							<AccordionTrigger>Session tokens</AccordionTrigger>
							<AccordionPanel>
								Cryptographic signing keys refreshed every twenty-four hours.
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</div>
			</SpecimenSection>
		</Stack>
	);
}
