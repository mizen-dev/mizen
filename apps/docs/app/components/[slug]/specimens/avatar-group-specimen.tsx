import { darkTheme, Heading, Stack, Text } from "@mizen-labs/ui";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@mizen-labs/ui/avatar-group";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

const ALEX_PORTRAIT = "/media/portrait-alex.jpg";

const JORDAN_PORTRAIT = "/media/portrait-jordan.jpg";

export function AvatarGroupSpecimen() {
	return (
		<Stack gap="8">
			<div {...props(specimenStyles.gallery)}>
				<Stack gap="1">
					<Heading level={3}>Design review</Heading>
					<Text size="ui" tone="muted">
						Three teammates are reviewing the next release.
					</Text>
				</Stack>
				<AvatarGroup aria-label="Design review participants" role="group">
					<Avatar>
						<AvatarFallback aria-label="Alex Rivera" role="img">
							AR
						</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback aria-label="Jordan Lee" role="img">
							JL
						</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback aria-label="Maya Chen" role="img">
							MC
						</AvatarFallback>
					</Avatar>
				</AvatarGroup>
			</div>
			<SpecimenSection
				description="Avatar group clusters overlapping avatars with inherited size and consumer-supplied children."
				title="Sizes"
			>
				<Stack>
					<AvatarGroup
						aria-label="Core team members (small)"
						data-testid="avatar-group-sm"
						role="group"
						size="sm"
					>
						<Avatar>
							<AvatarImage alt="Alex Rivera" src={ALEX_PORTRAIT} />
							<AvatarFallback>AR</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarImage alt="Jordan Lee" src={JORDAN_PORTRAIT} />
							<AvatarFallback>JL</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback aria-label="Maya Chen" role="img">
								MC
							</AvatarFallback>
						</Avatar>
					</AvatarGroup>

					<AvatarGroup
						aria-label="Core team members (default)"
						data-testid="avatar-group-default"
						role="group"
					>
						<Avatar>
							<AvatarImage alt="Alex Rivera" src={ALEX_PORTRAIT} />
							<AvatarFallback>AR</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarImage alt="Jordan Lee" src={JORDAN_PORTRAIT} />
							<AvatarFallback>JL</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback aria-label="Maya Chen" role="img">
								MC
							</AvatarFallback>
						</Avatar>
					</AvatarGroup>

					<AvatarGroup
						aria-label="Core team members (large)"
						data-testid="avatar-group-lg"
						role="group"
						size="lg"
					>
						<Avatar>
							<AvatarImage alt="Alex Rivera" src={ALEX_PORTRAIT} />
							<AvatarFallback>AR</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarImage alt="Jordan Lee" src={JORDAN_PORTRAIT} />
							<AvatarFallback>JL</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback aria-label="Maya Chen" role="img">
								MC
							</AvatarFallback>
						</Avatar>
					</AvatarGroup>
				</Stack>
			</SpecimenSection>

			<SpecimenSection
				description="Separation rings adapt to the dark surface background."
				title="Dark theme composition"
			>
				<div
					data-testid="avatar-group-dark-theme"
					{...props(darkTheme, pageStyles.themePanel)}
				>
					<AvatarGroup
						aria-label="Project contributors in dark theme"
						data-testid="avatar-group-dark"
						role="group"
					>
						<Avatar>
							<AvatarImage alt="Alex Rivera" src={ALEX_PORTRAIT} />
							<AvatarFallback>AR</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarImage alt="Jordan Lee" src={JORDAN_PORTRAIT} />
							<AvatarFallback>JL</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback aria-label="Maya Chen" role="img">
								MC
							</AvatarFallback>
						</Avatar>
					</AvatarGroup>
				</div>
			</SpecimenSection>
		</Stack>
	);
}
