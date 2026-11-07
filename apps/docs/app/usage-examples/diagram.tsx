import { Diagram } from "@mizen/ui/diagram";

const pipeline = `flowchart LR
  subgraph CI[Continuous integration]
    Build[Build] --> Test[Run tests]
  end
  Commit([Merge to main]) --> Build
  Test --> Review{Approved?}
  Review -->|Yes| Deploy[Deploy to production]
  Review -->|No| Fix[Request changes]
  Fix --> Commit`;

export function ApprovalWorkflow() {
	return (
		<Diagram
			aria-description="A merge to main builds and runs tests in continuous integration. Approved changes deploy to production; otherwise changes are requested and the loop starts again."
			aria-label="Release pipeline"
			source={pipeline}
		/>
	);
}
