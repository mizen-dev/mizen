"use client";
import { Button, type ButtonProps, Inline, Stack, Text } from "@mizen-labs/ui";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@mizen-labs/ui/collapsible";
import { props } from "@stylexjs/stylex";
import { IconChevronDown } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { collapsibleExampleStyles as styles } from "./collapsible.styles";

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
		<Button data-panel-open={dataPanelOpen} variant="ghost" {...rest}>
			{label}
			<IconChevronDown
				aria-hidden="true"
				data-panel-open={isOpen ? "" : undefined}
				size={16}
				{...props(styles.indicator)}
			/>
		</Button>
	);
}
export function CollapsibleDefaultDisclosureExample1() {
	return (
		<Stack gap="4">
			<Collapsible defaultOpen>
				<CollapsibleTrigger
					render={<DisclosureButton closedLabel="Deployment parameters" />}
				/>
				<CollapsiblePanel>
					<div {...props(styles.body)}>
						<dl {...props(styles.details)}>
							<dt {...props(styles.label)}>Region</dt>
							<dd {...props(styles.value)}>us-east-1</dd>
							<dt {...props(styles.label)}>Worker nodes</dt>
							<dd {...props(styles.value)}>3–12</dd>
							<dt {...props(styles.label)}>Autoscaling</dt>
							<dd {...props(styles.value)}>Enabled</dd>
						</dl>
					</div>
				</CollapsiblePanel>
			</Collapsible>
		</Stack>
	);
}
export function CollapsibleControlledDisclosureExample2() {
	const [open, setOpen] = useState(false);
	const handleToggleOpen = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);
	return (
		<Stack gap="4">
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
					<div {...props(styles.body)}>
						<Text size="ui" tone="muted">
							Recorded 14 authorization events and three configuration updates
							in this session.
						</Text>
					</div>
				</CollapsiblePanel>
			</Collapsible>
		</Stack>
	);
}
export function CollapsibleDisabledStateExample3() {
	return (
		<Stack gap="4">
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
					<div {...props(styles.body)}>
						<Text size="ui" tone="muted">
							Telemetry access requires administrator privileges.
						</Text>
					</div>
				</CollapsiblePanel>
			</Collapsible>
		</Stack>
	);
}
export function CollapsibleLongWrappingContentExample4() {
	return (
		<Stack gap="4">
			<Collapsible defaultOpen>
				<CollapsibleTrigger
					render={
						<DisclosureButton closedLabel="Compliance and retention policy" />
					}
				/>
				<CollapsiblePanel>
					<div {...props(styles.body)}>
						<Text size="ui" tone="muted">
							All session activities are tracked under system security
							guidelines. Audit logs, access tokens, and administrative actions
							undergo encrypted replication across redundant storage zones and
							remain archived for ninety days.
						</Text>
					</div>
				</CollapsiblePanel>
			</Collapsible>
		</Stack>
	);
}
