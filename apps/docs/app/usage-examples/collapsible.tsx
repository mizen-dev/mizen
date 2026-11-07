import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { IconChevronDown } from "@tabler/icons-react";
import { collapsibleExampleStyles as styles } from "./collapsible.styles";

const retention = [
	["Restore window", "30 days"],
	["Exports kept", "90 days"],
	["Shared links", "Disabled"],
] as const;

export function BasicCollapsible() {
	return (
		<Collapsible defaultOpen>
			<CollapsibleTrigger>
				View retention policy
				<IconChevronDown
					aria-hidden="true"
					size={16}
					{...props(styles.indicator)}
				/>
			</CollapsibleTrigger>
			<CollapsiblePanel>
				<div {...props(styles.body)}>
					<dl {...props(styles.details)}>
						{retention.map(([label, value]) => (
							<div key={label} {...props(styles.row)}>
								<dt {...props(styles.label)}>{label}</dt>
								<dd {...props(styles.value)}>{value}</dd>
							</div>
						))}
					</dl>
				</div>
			</CollapsiblePanel>
		</Collapsible>
	);
}
