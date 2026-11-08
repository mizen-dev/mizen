import { props } from "@stylexjs/stylex";
import { Link, useLoaderData } from "@tanstack/react-router";
import { docsStyles } from "../../../shared/ui/docs.styles";

export default function DocumentationPage() {
	const guides = useLoaderData({
		from: "__root__",
		select: (data) => data.guides,
	});
	return (
		<main id="docs-content" {...props(docsStyles.content)}>
			<article {...props(docsStyles.documentBody)}>
				<header {...props(docsStyles.header, docsStyles.documentHeader)}>
					<h1 {...props(docsStyles.title)}>Documentation</h1>
					<p {...props(docsStyles.lede)}>
						Component APIs, executable examples, and guidance for composing
						Mizen interfaces.
					</p>
				</header>
				<section {...props(docsStyles.documentSection)}>
					<h2 {...props(docsStyles.sectionTitle)}>Getting started</h2>
					{guides
						.filter((guide) => guide.group === undefined)
						.map(({ slug, title, description }) => (
							<div key={slug} {...props(docsStyles.exampleHeader)}>
								<Link
									params={{ guide: slug }}
									to="/docs/$guide"
									{...props(docsStyles.exampleTitle)}
								>
									{title}
								</Link>
								<p {...props(docsStyles.documentDescription)}>{description}</p>
							</div>
						))}
				</section>
				<section {...props(docsStyles.documentSection)}>
					<h2 {...props(docsStyles.sectionTitle)}>Use a component</h2>
					<p {...props(docsStyles.documentDescription)}>
						Choose a component from the navigation. Each page includes a preview
						with copyable code, the import line, anatomy for compound
						components, recommendations, usage boundaries, and an API reference.
					</p>
					<Link params={{ slug: "button" }} to="/docs/components/$slug">
						Start with Button
					</Link>
				</section>
			</article>
		</main>
	);
}
