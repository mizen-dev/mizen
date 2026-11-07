"use client";

import { Button, Stack } from "@mizen/ui";
import { Diagram } from "@mizen/ui/diagram";
import { useCallback, useState } from "react";

const sequence = `sequenceDiagram
  participant App
  participant Agent
  participant Tool
  App->>Agent: Review release
  Agent->>Tool: Run checks
  Tool-->>Agent: Checks passed
  Agent-->>App: Ready for approval`;

export function DiagramSequenceExample() {
	return (
		<Diagram
			aria-description="The app asks an agent to review a release. The agent runs a tool, receives passing checks, and requests approval."
			aria-label="Release review messages"
			source={sequence}
		/>
	);
}

const relationships = `erDiagram
  TEAM ||--o{ PROJECT : owns
  PROJECT ||--o{ RUN : contains
  TEAM {
    string id PK
    string name
  }
  PROJECT {
    string id PK
    string teamId FK
  }
  RUN {
    string id PK
    string projectId FK
  }`;

export function DiagramRelationshipsExample() {
	return (
		<Diagram
			aria-description="A team owns zero or more projects. Each project contains zero or more runs. Foreign keys connect each child to its parent."
			aria-label="Teams, projects, and runs"
			caption="Each project belongs to one team. Each run belongs to one project."
			source={relationships}
		/>
	);
}

const lifecycle = `stateDiagram-v2
  [*] --> Pending
  Pending --> Running: Start
  Running --> Waiting: Request approval
  Waiting --> Running: Approve
  Waiting --> Cancelled: Deny
  Running --> Complete: Finish
  Complete --> [*]
  Cancelled --> [*]`;

export function DiagramStateExample() {
	return (
		<Diagram
			aria-description="A pending run starts, may wait for approval, then resumes or is cancelled. A running task can finish as complete."
			aria-label="Agent run lifecycle"
			source={lifecycle}
		/>
	);
}

const initial = `flowchart LR
  Draft[Draft] --> Review[Review]`;
const extended = `flowchart LR
  Draft[Draft] --> Review[Review] --> Published[Published]`;

export function DiagramUpdatingExample() {
	const [published, setPublished] = useState(false);
	const toggle = useCallback(() => setPublished((current) => !current), []);
	return (
		<Stack gap="4">
			<Diagram
				aria-label="Publishing workflow"
				source={published ? extended : initial}
			/>
			<Button onClick={toggle} variant="outline">
				{published ? "Show draft flow" : "Add publication step"}
			</Button>
		</Stack>
	);
}

// A label with no closing bracket, so the parser reports where it stopped.
const invalid = `flowchart LR
  Draft[Draft --> Review[Review]`;

export function DiagramFeedbackExample() {
	return (
		<Stack gap="4">
			<Diagram aria-label="Loading workflow" source="" status="loading" />
			<Diagram aria-label="Empty workflow" source="" />
			<Diagram aria-label="Unavailable workflow" source="" status="error" />
			<Diagram aria-label="Invalid workflow" source={invalid} />
		</Stack>
	);
}

const traffic = `pie title Visitors by source
  "Organic" : 47900
  "Referral" : 23100
  "Paid" : 15500
  "Social" : 8400`;

export function DiagramPieExample() {
	return (
		<Diagram
			aria-description="Organic search brings about half of all visitors, then referral, paid, and social."
			aria-label="Visitors by source"
			source={traffic}
		/>
	);
}

const launch = `gantt
  title Northstar launch
  dateFormat YYYY-MM-DD
  section Design
    Research        :done, research, 2026-09-01, 10d
    Interface       :done, ui, after research, 14d
  section Build
    Components      :active, build, 2026-09-21, 21d
    Integrations    :integrations, after build, 10d
  section Launch
    Beta            :crit, beta, after integrations, 7d
    Release         :milestone, after beta, 0d`;

export function DiagramGanttExample() {
	return (
		<Diagram
			aria-description="Design ran through September, build runs into October, and a critical beta week leads to the release milestone."
			aria-label="Northstar launch plan"
			source={launch}
		/>
	);
}

const history = `timeline
  title Mizen releases
  2026 Q1 : Foundations : Layout and type
  2026 Q2 : Forms : Date pickers
  2026 Q3 : Charts : Diagrams
  2026 Q4 : Agentic : First release`;

export function DiagramTimelineExample() {
	return (
		<Diagram
			aria-description="Each quarter of 2026 added a group of components, ending with the first release."
			aria-label="Mizen release history"
			source={history}
		/>
	);
}

const model = `classDiagram
  class Workspace {
    +string id
    +string name
    +invite(email)
  }
  class Project {
    +string id
    +archive()
  }
  class Member {
    +string email
    +Role role
  }
  Workspace "1" o-- "*" Project : contains
  Workspace "1" o-- "*" Member : has`;

export function DiagramClassExample() {
	return (
		<Diagram
			aria-description="A workspace contains projects and has members. Each class lists its fields and methods."
			aria-label="Workspace model"
			source={model}
		/>
	);
}
