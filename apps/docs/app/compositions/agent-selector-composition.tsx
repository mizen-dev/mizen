"use client";

import {
	Field,
	FieldDescription,
	FieldLabel,
	Heading,
	Section,
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { useCallback, useState } from "react";

const agents = [
	{
		description: "Finds and summarizes source material.",
		id: "research",
		label: "Research",
		status: "Available",
	},
	{
		description: "Organizes steps and tracks decisions.",
		id: "planning",
		label: "Planning",
		status: "Available",
	},
	{
		description: "Drafts and edits workspace content.",
		disabled: true,
		id: "writing",
		label: "Writing · Offline",
		status: "Offline",
	},
] as const;

const agentItems = Object.fromEntries(
	agents.map(({ id, label }) => [id, label])
);

export function AgentSelectorExamples() {
	const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0].id);
	const selectedAgent =
		agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];
	const handleAgentChange = useCallback((nextValue: string | null) => {
		if (nextValue !== null) {
			setSelectedAgentId(nextValue);
		}
	}, []);

	return (
		<Section
			aria-labelledby="agent-selector-heading"
			data-testid="agent-selector-example"
		>
			<Stack gap="3">
				<div>
					<Heading id="agent-selector-heading" level={2} size="title">
						Choose an agent
					</Heading>
					<Text size="ui" tone="muted">
						Select a workspace assistant. Choosing one does not start a task.
					</Text>
				</div>
				<Field>
					<FieldLabel htmlFor="agent-selector">Agent</FieldLabel>
					<Select
						items={agentItems}
						onValueChange={handleAgentChange}
						value={selectedAgentId}
					>
						<SelectTrigger
							aria-describedby="agent-selector-details"
							id="agent-selector"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectPopup>
							{agents.map((agent) => (
								<SelectItem
									disabled={"disabled" in agent && agent.disabled}
									key={agent.id}
									value={agent.id}
								>
									{agent.label}
								</SelectItem>
							))}
						</SelectPopup>
					</Select>
					<FieldDescription id="agent-selector-details">
						{selectedAgent.description} Status: {selectedAgent.status}.
					</FieldDescription>
				</Field>
			</Stack>
		</Section>
	);
}
