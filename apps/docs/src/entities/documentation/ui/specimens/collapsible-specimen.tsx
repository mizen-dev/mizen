"use client";

import {
	Button,
	type ButtonProps,
	Card,
	CardPanel,
	darkTheme,
	Inline,
	Stack,
	Text,
} from "@mizen-labs/ui";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@mizen-labs/ui/collapsible";
import { props } from "@stylexjs/stylex";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { pageStyles } from "../page.styles";
import { SpecimenSection } from "./specimen-section";

function ChevronDownIcon({ open }: { open?: boolean }) {
	return open ? (
		<IconChevronUp aria-hidden="true" focusable="false" size="16" />
	) : (
		<IconChevronDown aria-hidden="true" focusable="false" size="16" />
	);
}

type DisclosureButtonProps = ButtonProps & {
	closedLabel: string;
	"data-panel-open"?: boolean | "";
	openLabel?: string;
};

function DisclosureButton({
	closedLabel,
	"data-panel-open": dataPanelOpen,
	openLabel,
	...rest
}: DisclosureButtonProps) {
	const isOpen = dataPanelOpen === "" || Boolean(dataPanelOpen);
	const label = isOpen && openLabel ? openLabel : closedLabel;

	return (
		<Button data-panel-open={dataPanelOpen} variant="outline" {...rest}>
			{label}
			<ChevronDownIcon open={isOpen} />
		</Button>
	);
}

export function CollapsibleSpecimen() {
	const [open, setOpen] = useState(false);
	const handleToggleOpen = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	return (
		<Stack gap="8">
			<SpecimenSection
				canvas={false}
				description="Uncontrolled disclosure panel for secondary configuration details."
				primary
				title="Default disclosure"
			>
				<Collapsible defaultOpen>
					<CollapsibleTrigger
						render={<DisclosureButton closedLabel="Deployment parameters" />}
					/>
					<CollapsiblePanel>
						<Card>
							<CardPanel>
								<Text>
									Active cluster: us-east-1. Autoscaling configured for three to
									twelve worker nodes.
								</Text>
							</CardPanel>
						</Card>
					</CollapsiblePanel>
				</Collapsible>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Coordinates disclosure state through external state and event handlers."
				title="Controlled disclosure"
			>
				<Inline>
					<Button onClick={handleToggleOpen} size="sm" variant="secondary">
						{open ? "Collapse audit log" : "Expand audit log"}
					</Button>
				</Inline>
				<Collapsible onOpenChange={setOpen} open={open}>
					<CollapsibleTrigger
						render={
							<DisclosureButton
								closedLabel="Show audit records"
								openLabel="Hide audit records"
							/>
						}
					/>
					<CollapsiblePanel>
						<Card>
							<CardPanel>
								<Text>
									Recorded 14 authorization events and three configuration
									updates in this session.
								</Text>
							</CardPanel>
						</Card>
					</CollapsiblePanel>
				</Collapsible>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Suppresses user interaction and preserves the closed panel state."
				title="Disabled state"
			>
				<Collapsible disabled>
					<CollapsibleTrigger
						render={
							<DisclosureButton
								closedLabel="Restricted telemetry data"
								disabled
							/>
						}
					/>
					<CollapsiblePanel>
						<Card>
							<CardPanel>
								<Text>Telemetry access requires administrator privileges.</Text>
							</CardPanel>
						</Card>
					</CollapsiblePanel>
				</Collapsible>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Preserves layout structure and text wrapping across responsive viewports."
				title="Long wrapping content"
			>
				<Collapsible defaultOpen>
					<CollapsibleTrigger
						render={
							<DisclosureButton closedLabel="Compliance and retention policy" />
						}
					/>
					<CollapsiblePanel>
						<Card>
							<CardPanel>
								<Text>
									All session activities are tracked under system security
									guidelines. Audit logs, access tokens, and administrative
									actions undergo encrypted replication across redundant storage
									zones and remain archived for ninety days.
								</Text>
							</CardPanel>
						</Card>
					</CollapsiblePanel>
				</Collapsible>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Adapts disclosure surfaces, borders, and typography in the dark theme."
				title="Dark theme composition"
			>
				<div
					data-testid="collapsible-dark-theme"
					{...props(darkTheme, pageStyles.themePanel)}
				>
					<Collapsible defaultOpen>
						<CollapsibleTrigger
							render={<DisclosureButton closedLabel="Security credentials" />}
						/>
						<CollapsiblePanel>
							<Card>
								<CardPanel>
									<Text>
										Mutual TLS termination and strict transport security active.
									</Text>
								</CardPanel>
							</Card>
						</CollapsiblePanel>
					</Collapsible>
				</div>
			</SpecimenSection>
		</Stack>
	);
}
