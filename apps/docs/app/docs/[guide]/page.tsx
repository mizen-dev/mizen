import { props } from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { docsStyles } from "../../components/docs.styles";
import { DocumentOutline } from "../../components/document-outline";
import { PageActions } from "../../components/page-actions";
import { SourceCode } from "../../components/source-code";
import { getGuide, guides } from "../../guides";

export function generateStaticParams() {
	return guides.map(({ slug }) => ({ guide: slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ guide: string }>;
}): Promise<Metadata> {
	const { guide: slug } = await params;
	const guide = getGuide(slug);
	return { description: guide?.description, title: guide?.title };
}

export default async function GuidePage({
	params,
}: {
	params: Promise<{ guide: string }>;
}) {
	const { guide: slug } = await params;
	const guide = getGuide(slug);
	if (!guide) {
		notFound();
	}
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
											<Link href={href}>{label}</Link>
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
