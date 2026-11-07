import { Heading, Inline, Stack, Text } from "@mizen-labs/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@mizen-labs/ui/avatar";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "../components/[slug]/specimens/specimen.styles";

const MAYA_PORTRAIT = "/media/portrait-maya.jpg";
export function AvatarProjectOwnerExample1() {
	return (
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
	);
}
export function AvatarSizesExample2() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
export function AvatarImageAndFallbackExample3() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
