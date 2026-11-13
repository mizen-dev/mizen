import { Button } from "@mizen-labs/ui/button";
import { Inline } from "@mizen-labs/ui/inline";
import { props } from "@stylexjs/stylex";
import { IconArrowUpRight } from "@tabler/icons-react";
import type { getAppPageData } from "../../../entities/documentation/api/app-data.server";
import { PageActions } from "../../../features/copy-document/ui/page-actions";
import { docsStyles } from "../../../shared/ui/docs.styles";
import { SourceCode } from "../../../shared/ui/source-code";
import { appsStyles } from "./apps.styles";

export default function AppPage({
	data: { app, files },
}: {
	data: NonNullable<ReturnType<typeof getAppPageData>>;
}) {
	const preview = `/apps/${app.slug}/preview`;
	return (
		<main id="docs-content" {...props(appsStyles.page)}>
			<header {...props(docsStyles.header, docsStyles.documentHeader)}>
				<p {...props(docsStyles.metadata)}>App</p>
				<h1 {...props(docsStyles.title)}>{app.title}</h1>
				<p {...props(docsStyles.lede)}>{app.description}</p>
				<Inline gap="2">
					<PageActions
						markdownPath={`/apps/${app.slug}/markdown`}
						name={app.title}
					/>
					<Button
						nativeButton={false}
						render={<a href={preview} rel="noreferrer" target="_blank" />}
						size="sm"
						variant="ghost"
					>
						Open full screen
						<IconArrowUpRight aria-hidden="true" size={16} />
					</Button>
				</Inline>
			</header>
			<iframe
				src={preview}
				title={`${app.title} preview`}
				{...props(appsStyles.frame)}
			/>
			<section
				aria-labelledby="setup-heading"
				id="setup"
				{...props(docsStyles.documentSection, appsStyles.section)}
			>
				<h2 id="setup-heading" {...props(docsStyles.sectionTitle)}>
					Set up
				</h2>
				<SourceCode code={app.setup.code} label="Set up commands" />
				{app.setup.paragraphs.map((paragraph) => (
					<p key={paragraph} {...props(docsStyles.documentDescription)}>
						{paragraph}
					</p>
				))}
			</section>
			<section
				aria-labelledby="files-heading"
				id="files"
				{...props(docsStyles.documentSection, appsStyles.section)}
			>
				<h2 id="files-heading" {...props(docsStyles.sectionTitle)}>
					Files
				</h2>
				{files.map(({ code, path }) => (
					<SourceCode code={code} key={path} label={path} title={path} />
				))}
			</section>
		</main>
	);
}
