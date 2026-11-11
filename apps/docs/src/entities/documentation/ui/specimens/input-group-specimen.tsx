import {
	Badge,
	Button,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
	Kbd,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../page.styles";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function InputGroupSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Prefixes and suffixes stay attached to their field."
				primary
				title="Public profile"
			>
				<Field>
					<FieldLabel>Website</FieldLabel>
					<InputGroup>
						<InputGroupInput placeholder="example.com" />
						<InputGroupAddon align="inline-start">
							<InputGroupText>https://</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<FieldDescription>Enter your public profile URL.</FieldDescription>
				</Field>

				<Field>
					<FieldLabel>Subdomain</FieldLabel>
					<InputGroup>
						<InputGroupInput defaultValue="acme" />
						<InputGroupAddon align="inline-end">
							<InputGroupText>.mizen.dev</InputGroupText>
							<Badge size="sm" variant="info">
								Verified
							</Badge>
						</InputGroupAddon>
					</InputGroup>
				</Field>
			</SpecimenSection>
			<SpecimenSection title="Workspace search">
				<Field>
					<FieldLabel>Search workspace</FieldLabel>
					<InputGroup>
						<InputGroupInput placeholder="Search documents…" />
						<InputGroupAddon align="inline-end">
							<Kbd>⌘K</Kbd>
							<Button size="sm" type="button">
								Find
							</Button>
						</InputGroupAddon>
					</InputGroup>
				</Field>
			</SpecimenSection>
			<SpecimenSection title="Team feedback">
				<Field>
					<FieldLabel>Feedback note</FieldLabel>
					<InputGroup>
						<InputGroupTextarea
							placeholder="Share your suggestions…"
							rows={3}
						/>
						<InputGroupAddon align="block-start">
							<InputGroupText>Markdown note</InputGroupText>
						</InputGroupAddon>
						<InputGroupAddon align="inline-start">
							<InputGroupText>&gt;</InputGroupText>
						</InputGroupAddon>
						<InputGroupAddon align="block-end">
							<InputGroupText>0/280 characters</InputGroupText>
							<Button size="sm" type="button" variant="secondary">
								Submit Note
							</Button>
						</InputGroupAddon>
					</InputGroup>
				</Field>

				<Field disabled invalid>
					<FieldLabel>Disabled invalid note</FieldLabel>
					<InputGroup>
						<InputGroupInput defaultValue="locked-invalid" disabled invalid />
						<InputGroupAddon align="inline-start">
							<InputGroupText>!</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
			</SpecimenSection>
			<SpecimenSection title="Control sizes">
				<div {...props(pageStyles.fieldGrid as never)}>
					<Field>
						<FieldLabel>Small size</FieldLabel>
						<InputGroup>
							<InputGroupInput placeholder="Filter…" size="sm" />
							<InputGroupAddon align="inline-start">
								<InputGroupText>#</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
					</Field>
					<Field>
						<FieldLabel>Default size</FieldLabel>
						<InputGroup>
							<InputGroupInput placeholder="Filter…" size="default" />
							<InputGroupAddon align="inline-start">
								<InputGroupText>#</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
					</Field>
					<Field>
						<FieldLabel>Large size</FieldLabel>
						<InputGroup>
							<InputGroupInput placeholder="Filter…" size="lg" />
							<InputGroupAddon align="inline-start">
								<InputGroupText>#</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
					</Field>
				</div>
			</SpecimenSection>
			<SpecimenSection title="Permissions and validation">
				<Field disabled>
					<FieldLabel>Disabled repository</FieldLabel>
					<InputGroup>
						<InputGroupInput defaultValue="main-branch" disabled />
						<InputGroupAddon align="inline-start">
							<InputGroupText>git://</InputGroupText>
						</InputGroupAddon>
						<InputGroupAddon align="inline-end">
							<Badge size="sm">Locked</Badge>
						</InputGroupAddon>
					</InputGroup>
				</Field>

				<Field>
					<FieldLabel>Read-only endpoint</FieldLabel>
					<InputGroup>
						<InputGroupInput defaultValue="api.mizen.dev/v1" readOnly />
						<InputGroupAddon align="inline-start">
							<InputGroupText>GET</InputGroupText>
						</InputGroupAddon>
						<InputGroupAddon align="inline-end">
							<Button size="sm" type="button" variant="ghost">
								Copy
							</Button>
						</InputGroupAddon>
					</InputGroup>
				</Field>

				<Field invalid>
					<FieldLabel>Database port</FieldLabel>
					<InputGroup>
						<InputGroupInput defaultValue="invalid-port" invalid />
						<InputGroupAddon align="inline-start">
							<InputGroupText>Port</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<FieldError match>Please enter a valid numeric port.</FieldError>
				</Field>
			</SpecimenSection>
		</div>
	);
}
