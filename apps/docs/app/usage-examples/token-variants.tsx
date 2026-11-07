"use client";
import { Inline, Stack, Text, Token, type TokenColor } from "@mizen/ui";
import { IconTag, IconUser } from "@tabler/icons-react";
import { useCallback, useState } from "react";

const tokenColors: TokenColor[] = [
	"default",
	"red",
	"orange",
	"yellow",
	"green",
	"teal",
	"cyan",
	"blue",
	"purple",
	"pink",
	"gray",
];
export function TokenColorsExample() {
	return (
		<Stack>
			<Inline>
				{tokenColors.map((color) => (
					<Token color={color} key={color} label={color} />
				))}
			</Inline>
			<Inline>
				{tokenColors.map((color) => (
					<Token color={color} disabled key={color} label={color} />
				))}
			</Inline>
		</Stack>
	);
}
export function TokenSizesExample() {
	return (
		<Inline>
			<Token icon={<IconTag aria-hidden size={12} />} label="Small" size="sm" />
			<Token
				color="purple"
				icon={<IconTag aria-hidden size={14} />}
				label="Medium"
			/>
			<Token
				color="blue"
				icon={<IconTag aria-hidden size={16} />}
				label="Large"
				size="lg"
			/>
		</Inline>
	);
}
export function TokenSelectionExample() {
	const [selected, setSelected] = useState(false);
	const toggle = useCallback(() => setSelected((current) => !current), []);
	return (
		<Stack>
			<Inline>
				<Token
					aria-description="Toggle the accessibility filter"
					aria-pressed={selected}
					color={selected ? "purple" : "default"}
					label="Accessibility filter"
					onClick={toggle}
				/>
				<Token href="/docs/components/activity-feed" label="Activity Feed" />
				<Token
					color="blue"
					disabled
					href="/docs/components/activity-feed"
					label="Unavailable link"
				/>
			</Inline>
			<Text aria-live="polite" size="ui" tone="muted">
				{selected ? "Accessibility filter selected" : "No filter selected"}
			</Text>
		</Stack>
	);
}
export function TokenRemovalExample() {
	const [visible, setVisible] = useState(true);
	const [opened, setOpened] = useState(false);
	const remove = useCallback(() => setVisible(false), []);
	const open = useCallback(() => setOpened(true), []);
	return (
		<Stack>
			<Inline>
				{visible ? (
					<Token
						color="pink"
						icon={<IconUser aria-hidden size={14} />}
						label="Maya Chen"
						onClick={open}
						onRemove={remove}
					/>
				) : null}
				<Token color="blue" endContent={<span>3</span>} label="Reviewers" />
				<Token
					color="purple"
					disabled
					label="Locked filter"
					onRemove={remove}
				/>
			</Inline>
			<Text aria-live="polite" size="ui" tone="muted">
				{visible ? "Maya is selected" : "Maya was removed"}
				{opened ? ". Maya’s details opened" : ""}
			</Text>
		</Stack>
	);
}
