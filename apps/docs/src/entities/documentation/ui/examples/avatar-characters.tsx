"use client";

import {
	Avatar,
	AvatarCharacter,
	AvatarFallback,
	AvatarImage,
	Field,
	FieldLabel,
	Inline,
	Input,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";
import { useState } from "react";

const styles = create({
	container: { maxWidth: "28rem", width: "100%" },
	gallery: {
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
	},
	identity: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
	},
});
const identities = [
	"Maya",
	"Alex",
	"Lina",
	"Theo",
	"Sam",
	"Jordan",
	"Robin",
	"Casey",
];

export function AvatarCharactersExample() {
	const [seed, setSeed] = useState("member:maya");
	return (
		<div {...props(styles.container)}>
			<Stack gap="4">
				<div {...props(styles.gallery)}>
					{identities.map((name) => (
						<div key={name} {...props(styles.identity)}>
							<AvatarCharacter
								seed={`member:${name.toLowerCase()}`}
								size="lg"
							/>
							<Text size="ui" tone="muted">
								{name}
							</Text>
						</div>
					))}
				</div>
				<Field name="characterSeed">
					<FieldLabel>Identity seed</FieldLabel>
					<Input onValueChange={setSeed} value={seed} />
				</Field>
				<Inline>
					<AvatarCharacter
						label="Small generated character"
						seed={seed}
						size="sm"
					/>
					<AvatarCharacter label="Generated character" seed={seed} />
					<AvatarCharacter
						label="Large generated character"
						seed={seed}
						size="lg"
					/>
				</Inline>
				<Text size="ui" tone="muted">
					The same seed keeps the same character across sizes and visits. Use a
					stable user ID.
				</Text>
			</Stack>
		</div>
	);
}

export function AvatarCharacterFallbackExample() {
	return (
		<Inline>
			<Avatar>
				<AvatarImage alt="Maya Chen" src="data:image/png;base64,broken" />
				<AvatarFallback>
					<AvatarCharacter label="Maya Chen" seed="member:maya" />
				</AvatarFallback>
			</Avatar>
			<Text>Maya Chen</Text>
		</Inline>
	);
}
