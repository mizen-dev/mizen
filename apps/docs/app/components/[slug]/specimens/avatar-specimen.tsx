import { darkTheme, Heading, Inline, Stack, Text } from "@mizen-labs/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@mizen-labs/ui/avatar";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

const MAYA_PORTRAIT = "/media/portrait-maya.jpg";

export function AvatarSpecimen() {
	return (
		<Stack gap="8">
			<div {...props(specimenStyles.gallery)}>
				<Heading level={3}>Project owner</Heading>
				<div {...props(specimenStyles.identity)}>
					<Avatar>
						<AvatarFallback aria-label="Maya Chen" role="img">
							MC
						</AvatarFallback>
					</Avatar>
					<Stack gap="1">
						<Text>Maya Chen</Text>
						<Text size="ui" tone="muted">
							Design systems · Northstar launch
						</Text>
					</Stack>
				</div>
			</div>
			<SpecimenSection
				description="Avatar scales across small, default, and large dimensions with proportional typography."
				title="Sizes"
			>
				<Inline>
					<Avatar data-testid="avatar-size-sm" size="sm">
						<AvatarFallback>SM</AvatarFallback>
					</Avatar>
					<Avatar data-testid="avatar-size-default" size="default">
						<AvatarFallback>DF</AvatarFallback>
					</Avatar>
					<Avatar data-testid="avatar-size-lg" size="lg">
						<AvatarFallback>LG</AvatarFallback>
					</Avatar>
				</Inline>
			</SpecimenSection>

			<SpecimenSection
				description="Avatar displays a loaded user image and falls back to consumer-supplied content on error."
				title="Image and fallback"
			>
				<Inline>
					<Avatar data-testid="avatar-loaded">
						<AvatarImage alt="Maya Chen" src={MAYA_PORTRAIT} />
						<AvatarFallback>MC</AvatarFallback>
					</Avatar>
					<Avatar data-testid="avatar-broken">
						<AvatarImage
							alt="Profile photo for Jordan Lee"
							src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cbroken%3E"
						/>
						<AvatarFallback aria-label="Jordan Lee" role="img">
							JL
						</AvatarFallback>
					</Avatar>
				</Inline>
			</SpecimenSection>

			<SpecimenSection
				description="Avatar adapts fallback surface and content colors under the dark theme."
				title="Dark theme composition"
			>
				<div
					data-testid="avatar-dark-theme"
					{...props(darkTheme, pageStyles.themePanel)}
				>
					<Avatar>
						<AvatarFallback>DF</AvatarFallback>
					</Avatar>
				</div>
			</SpecimenSection>
		</Stack>
	);
}
