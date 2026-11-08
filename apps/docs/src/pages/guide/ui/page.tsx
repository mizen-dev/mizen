import { props } from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import type { getGuide } from "../../../entities/documentation/model/guides";
import { DocumentOutline } from "../../../entities/documentation/ui/document-outline";
import { PageActions } from "../../../features/copy-document/ui/page-actions";
import { docsStyles } from "../../../shared/ui/docs.styles";
import { SourceCode } from "../../../shared/ui/source-code";

export default function GuidePage({
	guide,
}: {
	guide: NonNullable<ReturnType<typeof getGuide>>;
}) {
	const { slug } = guide;
	const sections = guide.sections.map(({ id, title }) => ({
		id,
		label: title,
	}));
	return (
		<main id="docs-content" {...props(docsStyles.content)}>
			<div {...props(docsStyles.documentLayout)}>
				<DocumentOutline key={slug} sections={sections} />
				<article data-slot="guide-document" {...props(docsStyles.documentBody)}>
					<header {...props(docsStyles.header, docsStyles.documentHeader)}>
						<p {...props(docsStyles.metadata)}>Documentation</p>
						<h1 {...props(docsStyles.title)}>{guide.title}</h1>
						<p {...props(docsStyles.lede)}>{guide.description}</p>
						<div {...props(docsStyles.pageActions)}>
							<PageActions
								markdownPath={`/docs/${slug}/markdown`}
								name={guide.title}
							/>
						</div>
					</header>
					{guide.sections.map(({ id, title, paragraphs, code, links }) => (
						<section
							aria-labelledby={`${id}-heading`}
							id={id}
							key={id}
							{...props(docsStyles.documentSection)}
						>
							<h2 id={`${id}-heading`} {...props(docsStyles.sectionTitle)}>
								{title}
							</h2>
							{paragraphs.map((paragraph) => (
								<p key={paragraph} {...props(docsStyles.documentDescription)}>
									{paragraph}
								</p>
							))}
							{code !== undefined && (
								<SourceCode
									code={code.value}
									label={`${title} code`}
									title={code.title}
								/>
							)}
							{links !== undefined && (
								<ul {...props(docsStyles.guideLinks)}>
									{links.map(({ href, label }) => (
										<li key={href}>
											<Link to={href}>{label}</Link>
										</li>
									))}
								</ul>
							)}
						</section>
					))}
				</article>
			</div>
		</main>
	);
}
