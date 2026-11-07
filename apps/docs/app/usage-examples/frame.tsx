import {
	Avatar,
	AvatarFallback,
	Button,
	Frame,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
	Group,
	Inline,
	Spacer,
	Stack,
	Text,
} from "@mizen-labs/ui";

const members = [
	["MC", "purple", "Maya Chen", "maya@northstar.dev", "Owner"],
	["LK", "blue", "Leo Kim", "leo@northstar.dev", "Admin"],
	["AS", "orange", "Ana Silva", "ana@northstar.dev", "Member"],
] as const;

export function AccountFrame() {
	return (
		<Frame>
			<FrameHeader>
				<FrameTitle>Team members</FrameTitle>
				<FrameDescription>People who can open this workspace.</FrameDescription>
			</FrameHeader>
			<FramePanel>
				<Stack gap="4">
					{members.map(([initials, color, name, email, role]) => (
						<Group key={email}>
							<Avatar>
								<AvatarFallback color={color}>{initials}</AvatarFallback>
							</Avatar>
							<Stack gap="0">
								<Text size="ui">{name}</Text>
								<Text size="ui" tone="muted">
									{email}
								</Text>
							</Stack>
							<Spacer />
							<Text size="ui" tone="muted">
								{role}
							</Text>
						</Group>
					))}
				</Stack>
			</FramePanel>
			<FrameFooter>
				<Inline>
					<Text size="ui" tone="muted">
						3 of 10 seats used
					</Text>
					<Spacer />
					<Button size="sm">Invite people</Button>
				</Inline>
			</FrameFooter>
		</Frame>
	);
}
