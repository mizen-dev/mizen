import {
	Button,
	Field,
	FieldDescription,
	FieldLabel,
	Input,
	Sheet,
	SheetClose,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetPopup,
	SheetTitle,
	SheetTrigger,
	Stack,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function SheetSpecimen() {
	return (
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Open settings while keeping the workspace in view."
				primary
				title="Workspace preferences"
			>
				<Sheet>
					<SheetTrigger
						render={<Button variant="brand">Edit workspace settings</Button>}
					/>
					<SheetPopup side="right" variant="inset">
						<SheetHeader>
							<SheetTitle>Workspace settings</SheetTitle>
							<SheetDescription>
								Configure team preferences, security, and integration defaults.
							</SheetDescription>
						</SheetHeader>
						<SheetPanel>
							<Stack>
								<Field>
									<FieldLabel>Workspace name</FieldLabel>
									<Input defaultValue="Acme Production" />
									<FieldDescription>
										Public identifier visible across projects.
									</FieldDescription>
								</Field>
								<Field>
									<FieldLabel>Custom domain</FieldLabel>
									<Input defaultValue="acme.mizen.dev" />
									<FieldDescription>
										Subdomain routed to your workspace.
									</FieldDescription>
								</Field>
								<Field>
									<FieldLabel>Notification email</FieldLabel>
									<Input defaultValue="alerts@acme.example" />
									<FieldDescription>
										Primary recipient for system status updates.
									</FieldDescription>
								</Field>
								<Field>
									<FieldLabel>Webhook endpoint</FieldLabel>
									<Input defaultValue="https://api.acme.example/events" />
									<FieldDescription>
										Destination for delivery receipts and audit logs.
									</FieldDescription>
								</Field>
								<Field>
									<FieldLabel>Data retention period</FieldLabel>
									<Input defaultValue="90 days" />
									<FieldDescription>
										Duration before archived run logs are purged.
									</FieldDescription>
								</Field>
								<Field>
									<FieldLabel>Backup frequency</FieldLabel>
									<Input defaultValue="Hourly snapshots" />
									<FieldDescription>
										Automated replication cadence for workspace data.
									</FieldDescription>
								</Field>
								<Field>
									<FieldLabel>Security contact</FieldLabel>
									<Input defaultValue="security@acme.example" />
									<FieldDescription>
										Point of contact for automated compliance notices.
									</FieldDescription>
								</Field>
							</Stack>
						</SheetPanel>
						<SheetFooter>
							<SheetClose render={<Button variant="outline">Cancel</Button>} />
							<SheetClose
								render={<Button variant="brand">Save changes</Button>}
							/>
						</SheetFooter>
					</SheetPopup>
				</Sheet>
			</SpecimenSection>
		</div>
	);
}
