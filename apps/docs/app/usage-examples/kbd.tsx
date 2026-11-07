import { Group, Kbd, KbdGroup, Spacer, Stack, Text } from "@mizen-labs/ui";

const shortcuts = [
	["Search", ["Cmd", "K"]],
	["Create an issue", ["C"]],
	["Go to inbox", ["G", "I"]],
	["Toggle the sidebar", ["Cmd", "/"]],
] as const;

export function SearchShortcut() {
	return (
		<Stack gap="3">
			{shortcuts.map(([action, keys]) => (
				<Group key={action}>
					<Text size="ui">{action}</Text>
					<Spacer />
					<KbdGroup>
						{keys.map((key) => (
							<Kbd key={key}>{key}</Kbd>
						))}
					</KbdGroup>
				</Group>
			))}
		</Stack>
	);
}
