import { Group, ToggleGroup, ToggleGroupItem } from "@mizen/ui";
import {
	IconAlignCenter,
	IconAlignLeft,
	IconAlignRight,
	IconBold,
	IconItalic,
	IconUnderline,
} from "@tabler/icons-react";

const styles = [
	["bold", "Bold", IconBold],
	["italic", "Italic", IconItalic],
	["underline", "Underline", IconUnderline],
] as const;

const alignments = [
	["left", "Left", IconAlignLeft],
	["center", "Center", IconAlignCenter],
	["right", "Right", IconAlignRight],
] as const;

export function TextAlignmentGroup() {
	return (
		<Group>
			<ToggleGroup
				aria-label="Formatting"
				defaultValue={["bold"]}
				multiple
				size="icon-sm"
			>
				{styles.map(([value, label, Icon]) => (
					<ToggleGroupItem aria-label={label} key={value} value={value}>
						<Icon aria-hidden="true" size={16} />
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<ToggleGroup
				aria-label="Text alignment"
				defaultValue={["left"]}
				size="icon-sm"
			>
				{alignments.map(([value, label, Icon]) => (
					<ToggleGroupItem aria-label={label} key={value} value={value}>
						<Icon aria-hidden="true" size={16} />
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Group>
	);
}
