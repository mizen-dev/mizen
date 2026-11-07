import { Group, Separator, Spacer, Stack, Text } from "@mizen/ui";

const items = [
	["Team plan, 8 seats", "$192.00"],
	["Extra storage, 100 GB", "$20.00"],
] as const;

export function AccountDetailsDivider() {
	return (
		<Stack gap="3">
			{items.map(([label, value]) => (
				<Group key={label}>
					<Text size="ui">{label}</Text>
					<Spacer />
					<Text size="ui">{value}</Text>
				</Group>
			))}
			<Separator />
			<Group>
				<Text>Total due today</Text>
				<Spacer />
				<Text>$212.00</Text>
			</Group>
		</Stack>
	);
}
