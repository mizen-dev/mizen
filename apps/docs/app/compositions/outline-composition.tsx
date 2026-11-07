import { Heading, Link, List, ListItem, Section, Stack, Text } from "@mizen/ui";
import { colors } from "@mizen/ui/colors.stylex";
import { borderWidth, focus, focusMotion } from "@mizen/ui/interaction.stylex";
import { create, props } from "@stylexjs/stylex";

const outlineStyles = create({
	anchorTarget: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		scrollMarginBlockStart: "5rem",
	},
});

const outlineItems = [
	{ href: "#outline-overview", label: "Overview" },
	{ href: "#outline-structure", label: "Page structure" },
	{
		href: "#outline-keyboard",
		label: "Keyboard and screen-reader considerations",
	},
] as const;

export function OutlineExamples() {
	return (
		<Section
			aria-labelledby="outline-example-heading"
			data-testid="outline-example"
		>
			<Stack>
				<Heading id="outline-example-heading" level={2} size="title">
					Page outline
				</Heading>
				<Text>
					A short table of contents with ordinary links to named sections below.
				</Text>
				<nav aria-label="Guide sections">
					<List>
						{outlineItems.map(({ href, label }) => (
							<ListItem key={href}>
								<Link href={href}>{label}</Link>
							</ListItem>
						))}
					</List>
				</nav>
				<Stack>
					<section
						aria-labelledby="outline-overview-heading"
						id="outline-overview"
						tabIndex={-1}
						{...props(outlineStyles.anchorTarget)}
					>
						<Stack>
							<Heading id="outline-overview-heading" level={3}>
								Overview
							</Heading>
							<Text>
								Use stable section IDs so links keep working as copy changes.
							</Text>
						</Stack>
					</section>
					<section
						aria-labelledby="outline-structure-heading"
						id="outline-structure"
						tabIndex={-1}
						{...props(outlineStyles.anchorTarget)}
					>
						<Stack>
							<Heading id="outline-structure-heading" level={3}>
								Page structure
							</Heading>
							<Text>
								Keep the outline next to the content it describes and preserve
								the page’s heading order.
							</Text>
						</Stack>
					</section>
					<section
						aria-labelledby="outline-keyboard-heading"
						id="outline-keyboard"
						tabIndex={-1}
						{...props(outlineStyles.anchorTarget)}
					>
						<Stack>
							<Heading id="outline-keyboard-heading" level={3}>
								Keyboard and screen-reader considerations
							</Heading>
							<Text>
								Each link uses native fragment navigation and works without a
								client-side scroll tracker.
							</Text>
						</Stack>
					</section>
				</Stack>
			</Stack>
		</Section>
	);
}
