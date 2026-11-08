import {
	InlineCitation,
	type InlineCitationSource,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";

const styles = create({
	frame: { maxInlineSize: "34rem", minInlineSize: 0, width: "100%" },
});

const WEB_DEV_ICON =
	"https://www.gstatic.com/devrel-devsite/prod/veed85ba0e3651062c793a40796e84fb34afbf8489308d45f92d5448e587e3f03/web/images/favicon.png";

const mdn: InlineCitationSource = {
	description:
		"Container queries apply styles based on the size of an element's container.",
	href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
	title: "CSS container queries",
};

const webDev: InlineCitationSource = {
	description: "Size container queries are supported in all stable browsers.",
	href: "https://web.dev/blog/cq-stable",
	icon: WEB_DEV_ICON,
	title: "Container queries land in stable browsers",
};

const caniuse: InlineCitationSource = {
	description: "Supported by about 93% of browsers in use.",
	href: "https://caniuse.com/css-container-queries",
	icon: "https://caniuse.com/img/favicon-128.png",
	title: "CSS Container Queries (Size)",
};

// Each claim carries its source; hover or focus a chip to preview it.
export function CitedParagraph() {
	return (
		<div {...props(styles.frame)}>
			<Stack gap="3">
				<Text>
					Container queries style an element by the size of its container, where
					media queries look at the viewport.
					<InlineCitation sources={[mdn]} /> Every current browser supports
					them.
					<InlineCitation sources={[webDev, caniuse]} />
				</Text>
			</Stack>
		</div>
	);
}

// A file from the person's workspace shows as text, with nothing to open.
export function DocumentCitation() {
	return (
		<div {...props(styles.frame)}>
			<Text>
				The design review asked for the card to switch layout at 400px.
				<InlineCitation sources={[{ title: "Q3 design review.pdf" }]} />
			</Text>
		</div>
	);
}
