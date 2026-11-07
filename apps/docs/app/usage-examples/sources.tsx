import { Sources, type SourcesItem } from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";

const styles = create({
	// Collapsed, the row sizes to itself, so it sits centered in the stage.
	fit: {
		inlineSize: "fit-content",
		marginInline: "auto",
		maxInlineSize: "34rem",
		minInlineSize: 0,
	},
	frame: { maxInlineSize: "34rem", minInlineSize: 0, width: "100%" },
});

const WEB_DEV_ICON =
	"https://www.gstatic.com/devrel-devsite/prod/veed85ba0e3651062c793a40796e84fb34afbf8489308d45f92d5448e587e3f03/web/images/favicon.png";

const pages: readonly SourcesItem[] = [
	{
		href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
		title: "CSS container queries",
	},
	{
		href: "https://web.dev/blog/cq-stable",
		// web.dev serves no /favicon.ico, so name its icon.
		icon: WEB_DEV_ICON,
		title: "Container queries land in stable browsers",
	},
	{
		href: "https://caniuse.com/css-container-queries",
		icon: "https://caniuse.com/img/favicon-128.png",
		title: "CSS Container Queries (Size)",
	},
	// Cited twice in the reply; listed once.
	{
		href: "https://web.dev/blog/cq-stable",
		icon: WEB_DEV_ICON,
		title: "Container queries land in stable browsers",
	},
];

// The pages an agent read for its answer, open to the list.
export function ReplySources() {
	return (
		<div {...props(styles.frame)}>
			<Sources defaultOpen sources={pages} />
		</div>
	);
}

// Files from the person's workspace show as text beside the web pages.
export function DocumentSources() {
	return (
		<div {...props(styles.fit)}>
			<Sources
				sources={[
					pages[0],
					{ title: "Q3 design review.pdf" },
					{ title: "Card component spec.md" },
				].flatMap((source) => (source ? [source] : []))}
			/>
		</div>
	);
}
