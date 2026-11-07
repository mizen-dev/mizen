import { Button, Inline, Stack, Text } from "@mizen/ui";
import { Kbd, KbdGroup } from "@mizen/ui/kbd";

export function KbdStandaloneKeysExample1() {
	return (
		<Stack gap="4">
			<Inline data-testid="kbd-standalone">
				<Kbd>K</Kbd>
				<Kbd>Cmd</Kbd>
				<Kbd>Ctrl</Kbd>
				<Kbd>Shift</Kbd>
				<Kbd>Esc</Kbd>
				<Kbd>Tab</Kbd>
				<Kbd>Enter</Kbd>
			</Inline>
		</Stack>
	);
}
export function KbdGroupedShortcutsExample2() {
	return (
		<Stack gap="4">
			<Inline data-testid="kbd-grouped">
				<KbdGroup>
					<Kbd>Cmd</Kbd>
					<Kbd>K</Kbd>
				</KbdGroup>
				<KbdGroup>
					<Kbd>Cmd</Kbd>
					<Kbd>Shift</Kbd>
					<Kbd>P</Kbd>
				</KbdGroup>
				<KbdGroup>
					<Kbd>Ctrl</Kbd>
					<Kbd>Alt</Kbd>
					<Kbd>Delete</Kbd>
				</KbdGroup>
			</Inline>
		</Stack>
	);
}
export function KbdInlineTextCompositionExample3() {
	return (
		<Stack gap="4">
			<Stack data-testid="kbd-inline-composition">
				<Text>
					Press{" "}
					<KbdGroup>
						<Kbd>Cmd</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>{" "}
					anywhere to open the global command palette.
				</Text>
				<Text>
					Use <Kbd>Tab</Kbd> and <Kbd>Shift</Kbd> to navigate focusable
					controls, or press <Kbd>Esc</Kbd> to dismiss active overlays.
				</Text>
			</Stack>
		</Stack>
	);
}
export function KbdActionCompositionExample4() {
	return (
		<Stack gap="4">
			<Inline data-testid="kbd-action-composition">
				<Button variant="secondary">
					Quick search{" "}
					<KbdGroup>
						<Kbd>Cmd</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</Button>
				<Button variant="outline">
					Open project{" "}
					<KbdGroup>
						<Kbd>Cmd</Kbd>
						<Kbd>O</Kbd>
					</KbdGroup>
				</Button>
			</Inline>
		</Stack>
	);
}
