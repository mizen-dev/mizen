import { Link, Text } from "@mizen/ui";

export function DocumentationLink() {
	return (
		<Text>
			Start with the <Link href="/docs/deploy">deployment guide</Link>, or ask
			in the <Link href="/community">community forum</Link>.
		</Text>
	);
}
