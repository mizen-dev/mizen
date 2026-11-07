import { Button, darkTheme, Inline, Stack, Text } from "@mizen/ui";
import { Kbd, KbdGroup } from "@mizen/ui/kbd";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { SpecimenSection } from "./specimen-section";

export function KbdSpecimen() {
	return (
		<Stack data-testid="kbd-specimen" gap="8">
			<SpecimenSection
				description="Single key caps represent individual keystrokes, modifier keys, and navigation controls."
				primary
				title="Standalone keys"
			>
				<Inline data-testid="kbd-standalone">
					<Kbd>K</Kbd>
					<Kbd>Cmd</Kbd>
					<Kbd>Ctrl</Kbd>
					<Kbd>Shift</Kbd>
					<Kbd>Esc</Kbd>
					<Kbd>Tab</Kbd>
					<Kbd>Enter</Kbd>
				</Inline>
			</SpecimenSection>

			<SpecimenSection
				description="Compose related key sequences with KbdGroup to present multi-key combinations."
				title="Grouped shortcuts"
			>
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
			</SpecimenSection>

			<SpecimenSection
				description="Keys and shortcut groups sit inline with instructional body text to explain keyboard navigation."
				title="Inline text composition"
			>
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
			</SpecimenSection>

			<SpecimenSection
				description="Pair shortcut indicators with action triggers to display available hotkeys directly on controls."
				title="Action composition"
			>
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
			</SpecimenSection>

			<SpecimenSection
				description="Key surfaces and text adapt contrast automatically in dark theme."
				title="Dark theme composition"
			>
				<div
					data-testid="kbd-dark-theme"
					{...props(darkTheme, pageStyles.themePanel)}
				>
					<Inline>
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
						<Kbd>Esc</Kbd>
					</Inline>
				</div>
			</SpecimenSection>
		</Stack>
	);
}
