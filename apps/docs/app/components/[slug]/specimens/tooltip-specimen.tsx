import {
	Button,
	Group,
	Heading,
	Text,
	Tooltip,
	TooltipPopup,
	TooltipProvider,
	TooltipTrigger,
} from "@mizen/ui";
import { IconPlus } from "@tabler/icons-react";
import { SpecimenSection } from "./specimen-section";

function PlusIcon() {
	return <IconPlus aria-hidden="true" focusable="false" size="1em" />;
}

export function TooltipSpecimen() {
	return (
		<TooltipProvider>
			<SpecimenSection
				description="Hover or focus an action to see its description."
				primary
				title="Project shortcuts"
			>
				<Heading level={4}>Northstar launch</Heading>
				<Text size="ui" tone="muted">
					Create a project item or preview the release details.
				</Text>
				<Group>
					<Tooltip>
						<TooltipTrigger
							render={
								<Button aria-label="Create item" size="icon-sm">
									<PlusIcon />
								</Button>
							}
						/>
						<TooltipPopup>Create item</TooltipPopup>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							render={<Button variant="outline">Preview</Button>}
						/>
						<TooltipPopup side="bottom">Preview details</TooltipPopup>
					</Tooltip>
				</Group>
			</SpecimenSection>
		</TooltipProvider>
	);
}
