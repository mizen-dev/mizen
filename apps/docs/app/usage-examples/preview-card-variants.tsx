import {
	Avatar,
	AvatarFallback,
	Badge,
	Inline,
	PreviewCard,
	PreviewCardPopup,
	PreviewCardTrigger,
	Stack,
	Text,
} from "@mizen/ui";
import { colors } from "@mizen/ui/colors.stylex";
import { fontSize, fontWeight, lineHeight } from "@mizen/ui/typography.stylex";
import { create, props } from "@stylexjs/stylex";

const styles = create({
	title: {
		color: colors.content,
		fontSize: fontSize["20"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["28"],
		marginBlock: 0,
		overflowWrap: "anywhere",
	},
});

export function PreviewCardAlexMorganExample1() {
	return (
		<PreviewCard>
			<PreviewCardTrigger href="/team/alex-morgan">
				Alex Morgan
			</PreviewCardTrigger>
			<PreviewCardPopup>
				<Stack>
					<Inline>
						<Avatar>
							<AvatarFallback>AM</AvatarFallback>
						</Avatar>
						<Stack gap="1">
							<h4 {...props(styles.title)}>Alex Morgan</h4>
							<Text size="ui" tone="muted">
								@alexm
							</Text>
						</Stack>
					</Inline>
					<Text size="ui" tone="muted">
						Design Systems Lead at Mizen. Focused on accessible interface
						composition and token architectures.
					</Text>
					<Inline>
						<Badge variant="secondary">Design Systems</Badge>
						<Badge variant="outline">Tokyo</Badge>
					</Inline>
				</Stack>
			</PreviewCardPopup>
		</PreviewCard>
	);
}
export function PreviewCardMizentokensExample2() {
	return (
		<PreviewCard>
			<PreviewCardTrigger href="/projects/mizen-tokens">
				mizen-tokens
			</PreviewCardTrigger>
			<PreviewCardPopup>
				<Stack>
					<Inline>
						<h4 {...props(styles.title)}>mizen-tokens</h4>
						<Badge variant="brand">v0.1.0</Badge>
					</Inline>
					<Text size="ui" tone="muted">
						Canonical StyleX design tokens for surface elevation, typography,
						motion, and interaction states.
					</Text>
					<Inline>
						<Badge variant="outline">MIT License</Badge>
						<Badge variant="success">Passing</Badge>
					</Inline>
				</Stack>
			</PreviewCardPopup>
		</PreviewCard>
	);
}
