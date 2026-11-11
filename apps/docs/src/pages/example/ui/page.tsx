import { colors } from "@mizen-labs/ui/colors.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";
import { usageComponents } from "../../../entities/documentation/ui/example-components.gen";

const styles = create({
	// A Page brings its own inset; anything else gets the same one.
	screen: {
		backgroundColor: colors.surface,
		minBlockSize: "100dvh",
		padding: { ":has(> [data-slot='page'])": 0, default: space["6"] },
	},
});

export default function ExamplePage({ name }: { name: string }) {
	const Example = usageComponents[name];
	return (
		<main
			data-slot="example-screen"
			id="docs-content"
			{...props(styles.screen)}
		>
			{Example ? <Example /> : null}
		</main>
	);
}
