import { Heading, Stack, Text } from "@mizen/ui";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@mizen/ui/avatar-group";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "../components/[slug]/specimens/specimen.styles";

const ALEX_PORTRAIT = "/media/portrait-alex.jpg";
const JORDAN_PORTRAIT = "/media/portrait-jordan.jpg";
export function AvatarGroupDesignReviewExample1() {
	return (
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
	);
}
export function AvatarGroupSizesExample2() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
