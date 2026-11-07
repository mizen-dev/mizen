import {
	Card,
	CardPanel,
	List,
	ListContent,
	ListItem,
	ScrollArea,
	Text,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";

// The scroll region needs a bounded parent.
const styles = create({ region: { blockSize: "14rem" } });

const events = [
	["Maya Chen deployed Northstar 2.9", "2 minutes ago"],
	["Leo Kim approved the copy review", "14 minutes ago"],
	["Ana Silva uploaded new mockups", "1 hour ago"],
	["Maya Chen merged the pricing branch", "2 hours ago"],
	["Jo Reyes opened a billing issue", "3 hours ago"],
	["Leo Kim renamed the Q3 board", "5 hours ago"],
	["Ana Silva invited two reviewers", "6 hours ago"],
	["Jo Reyes closed the billing issue", "8 hours ago"],
] as const;

export function AuditEntries() {
	return (
		<Card>
			<CardPanel>
				<div {...props(styles.region)}>
					<ScrollArea
						aria-label="Recent activity"
						overscrollContain
						role="region"
						scrollbarGutter
						scrollFade
					>
						<List aria-label="Events">
							{events.map(([event, time]) => (
								<ListItem key={event}>
									<ListContent>
										<Text size="ui">{event}</Text>
										<Text size="ui" tone="muted">
											{time}
										</Text>
									</ListContent>
								</ListItem>
							))}
						</List>
					</ScrollArea>
				</div>
			</CardPanel>
		</Card>
	);
}
