import { props } from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import type { getComponentPageData } from "../../../entities/documentation/api/component-data.server";
import type {
	getComponentUsage,
	getUsageExamples,
} from "../../../entities/documentation/lib/example-sources";
import { importStatement } from "../../../entities/documentation/lib/import-statement";
import type { ComponentDoc } from "../../../entities/documentation/model/docs-registry";
import { ComponentApiProperties } from "../../../entities/documentation/ui/api-properties";
import {
	DocumentOutline,
	type OutlineSection,
} from "../../../entities/documentation/ui/document-outline";
import {
	getSpecimen,
	usageComponents,
} from "../../../entities/documentation/ui/example-components.gen";
import { GuidanceTable } from "../../../entities/documentation/ui/guidance-table";
import { PageActions } from "../../../features/copy-document/ui/page-actions";
import { docsStyles } from "../../../shared/ui/docs.styles";
import { ExamplePreview } from "../../../shared/ui/example-preview";
import { SourceCode } from "../../../shared/ui/source-code";

const sections = [
	["preview", "Preview"],
	["usage", "Usage"],
	["anatomy", "Anatomy"],
	["examples", "Examples"],
	["recommendations", "Recommendations"],
	["boundaries", "Usage boundaries"],
	["api", "API reference"],
] as const;

const widePreviews = new Set([
	"conversation",
	"message-scroller",
	"terminal",
	"question-card",
	"approval-card",
	"inline-citation",
	"task-list",
	"sources",
	"message",
	"diagram",
	"tool-call",
	"slider",
	"blockquote",
	"citation",
	"code",
	"collapsible",
	"inline",
	"kbd",
	"link",
	"separator",
	"spacer",
	"text",
	"visually-hidden",
	"alert",
	"button",
	"date-time-input",
	"lightbox",
	"pagination",
	"overflow-list",
	"sankey-chart",
	"radial-bars",
	"radar-chart",
	"calendar-heatmap",
	"score-gauge",
	"progress-rings",
	"activity-feed",
	"stepper",
	"file-upload",
	"aspect-ratio",
	"toolbar",
	"composer",
	"tabs",
	"navigation-menu",
	"form",
	"fieldset",
	"frame",
	"card",
	"grid",
	"chart-frame",
	"chart-legend",
	"chart-tooltip",
	"area-chart",
	"bar-list",
	"category-comparison",
	"funnel",
	"metric-trend",
	"distribution",
	"heatmap",
	"part-to-whole",
	"scatter-chart",
	"time-series",
	"table",
	"data-table",
	"list",
	"activity-feed",
	"markdown",
	"code-block",
	"scroll-area",
	"empty",
	"error-state",
	"section",
]);

// Container-sized content fills the stage; wide content scrolls inside it.
const fillPreviews = new Set([
	"diagram",
	"slider",
	"grid",
	"progress-rings",
	"aspect-ratio",
	"lightbox",
	"sankey-chart",
	"radial-bars",
	"radar-chart",
	"calendar-heatmap",
	"heatmap",
	"score-gauge",
	"area-chart",
	"bar-list",
	"category-comparison",
	"code-block",
	"data-table",
	"distribution",
	"funnel",
	"markdown",
	"metric-trend",
	"part-to-whole",
	"scatter-chart",
	"skeleton",
	"spacer",
	"table",
	"time-series",
]);

function getDemoProps(slug: string) {
	return props(
		docsStyles.controlDemo,
		widePreviews.has(slug) && docsStyles.wideDemo,
		fillPreviews.has(slug) && docsStyles.fillDemo
	);
}

function buildOutline(
	component: ComponentDoc,
	usageExamples: ReturnType<typeof getUsageExamples>,
	hasAnatomy: boolean
) {
	const shown = sections.filter(([id]) => id !== "anatomy" || hasAnatomy);
	const outlineSections = shown.flatMap<OutlineSection>(([id, title]) =>
		id === "examples"
			? [
					{ id, label: title },
					...usageExamples.map((usage) => ({
						id: usage.name,
						label: usage.title,
						nested: true,
					})),
				]
			: [
					{ id, label: title },
					...(id === "api"
						? (component.apiSections ?? []).map((section) => ({
								id: `api-${section.name}`,
								label: section.name,
								nested: true,
							}))
						: []),
				]
	);
	// Usage sections render just before the examples, so list them there too.
	const examplesAt = outlineSections.findIndex(({ id }) => id === "examples");
	outlineSections.splice(
		examplesAt === -1 ? outlineSections.length : examplesAt,
		0,
		...(component.usageSections ?? []).map((section) => ({
			id: section.id,
			label: section.title,
		}))
	);
	return outlineSections;
}

function UsageSections({
	name,
	usage,
}: {
	name: string;
	usage: ReturnType<typeof getComponentUsage>;
}) {
	return (
		<>
			<section
				aria-labelledby="usage-heading"
				id="usage"
				{...props(docsStyles.documentSection)}
			>
				<h2 id="usage-heading" {...props(docsStyles.sectionTitle)}>
					Usage
				</h2>
				<SourceCode
					code={importStatement(usage.imports)}
					label={`${name} import`}
				/>
			</section>
			{usage.anatomy ? (
				<section
					aria-labelledby="anatomy-heading"
					id="anatomy"
					{...props(docsStyles.documentSection)}
				>
					<h2 id="anatomy-heading" {...props(docsStyles.sectionTitle)}>
						Anatomy
					</h2>
					<p {...props(docsStyles.documentDescription)}>
						The parts and how they nest, taken from the preview above.
					</p>
					<SourceCode code={usage.anatomy} label={`${name} anatomy`} />
				</section>
			) : null}
		</>
	);
}

function Pager({
	next,
	previous,
}: NonNullable<ReturnType<typeof getComponentPageData>>["adjacent"]) {
	return (
		<nav aria-label="Previous and next" {...props(docsStyles.pager)}>
			{previous ? (
				<Link
					params={{ slug: previous.slug }}
					to="/docs/components/$slug"
					{...props(docsStyles.pagerLink)}
				>
					<span {...props(docsStyles.pagerLabel)}>Previous</span>
					{previous.name}
				</Link>
			) : (
				<span />
			)}
			{next ? (
				<Link
					params={{ slug: next.slug }}
					to="/docs/components/$slug"
					{...props(docsStyles.pagerLink, docsStyles.pagerNext)}
				>
					<span {...props(docsStyles.pagerLabel)}>Next</span>
					{next.name}
				</Link>
			) : null}
		</nav>
	);
}

export default function ComponentPage({
	data,
}: {
	data: NonNullable<ReturnType<typeof getComponentPageData>>;
}) {
	const {
		component,
		presentation,
		guidance,
		example,
		usageExamples,
		usage,
		adjacent,
	} = data;
	const { slug } = component;
	const Specimen = presentation
		? usageComponents[presentation.name]
		: getSpecimen(slug);
	const outlineSections = buildOutline(
		component,
		usageExamples,
		usage.anatomy !== null
	);
	return (
		<main id="docs-content" {...props(docsStyles.content)}>
			<div {...props(docsStyles.documentLayout)}>
				<DocumentOutline key={slug} sections={outlineSections} />
				<article
					data-slot="component-document"
					{...props(docsStyles.documentBody)}
				>
					<header {...props(docsStyles.header, docsStyles.documentHeader)}>
						<p {...props(docsStyles.metadata)}>{component.category}</p>
						<h1 {...props(docsStyles.title)}>{component.name}</h1>
						<p {...props(docsStyles.lede)}>{component.description}</p>
						<div {...props(docsStyles.pageActions)}>
							<PageActions
								markdownPath={`/docs/components/${slug}/markdown`}
								name={component.name}
							/>
						</div>
					</header>
					<section
						aria-label={`${component.name} presentation`}
						id="preview"
						{...props(docsStyles.documentSection)}
					>
						<ExamplePreview
							code={
								<div {...props(docsStyles.documentSection)}>
									{example.files.map(({ code, path }) => (
										<SourceCode
											code={code}
											key={path}
											label={`${component.name} example code`}
										/>
									))}
								</div>
							}
							label={`${component.name} presentation`}
						>
							<section
								aria-label={`${component.name} preview`}
								data-slot="component-preview"
								// biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard focus enables scrolling oversized demonstrations.
								tabIndex={0}
								{...props(docsStyles.previewFrame, docsStyles.usageStage)}
							>
								<div id={presentation?.name} {...getDemoProps(slug)}>
									{/* eslint-disable-next-line react-hooks/static-components -- A registry lookup: each slug maps to a module-level component, so its identity never changes. */}
									<Specimen />
								</div>
							</section>
						</ExamplePreview>
					</section>
					<UsageSections name={component.name} usage={usage} />
					{component.usageSections?.map((section) => (
						<section
							aria-labelledby={`${section.id}-heading`}
							id={section.id}
							key={section.id}
							{...props(docsStyles.documentSection)}
						>
							<h2
								id={`${section.id}-heading`}
								{...props(docsStyles.sectionTitle)}
							>
								{section.title}
							</h2>
							<p {...props(docsStyles.documentDescription)}>
								{section.description}
							</p>
							<SourceCode code={section.code} label={section.title} />
						</section>
					))}
					<section
						aria-labelledby="examples-heading"
						id="examples"
						{...props(docsStyles.documentSection)}
					>
						<h2 id="examples-heading" {...props(docsStyles.sectionTitle)}>
							Examples
						</h2>
						{usageExamples.map(({ name, title, description, code }) => {
							const Example = usageComponents[name];
							return (
								<section
									aria-labelledby={`${name}-heading`}
									id={name}
									key={name}
									{...props(
										docsStyles.documentSection,
										docsStyles.usageSection
									)}
								>
									<h3
										id={`${name}-heading`}
										{...props(docsStyles.sectionTitle, docsStyles.usageTitle)}
									>
										{title}
									</h3>
									{description ? (
										<p {...props(docsStyles.documentDescription)}>
											{description}
										</p>
									) : null}
									<ExamplePreview
										code={
											<SourceCode
												code={code}
												label={`${component.name} usage: ${title}`}
											/>
										}
										label={`${component.name}: ${title}`}
									>
										<section
											aria-label={`${component.name}: ${title} example`}
											data-slot="usage-preview"
											// biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard focus enables scrolling oversized demonstrations.
											tabIndex={0}
											{...props(docsStyles.previewFrame, docsStyles.usageStage)}
										>
											<div {...getDemoProps(slug)}>
												<Example />
											</div>
										</section>
									</ExamplePreview>
								</section>
							);
						})}
					</section>
					<section
						aria-labelledby="recommendations-heading"
						id="recommendations"
						{...props(docsStyles.documentSection)}
					>
						<h2
							id="recommendations-heading"
							{...props(docsStyles.sectionTitle)}
						>
							Recommendations
						</h2>
						<GuidanceTable
							entries={guidance.recommendations}
							kind="recommendation"
							label={`${component.name} recommendations`}
						/>
					</section>
					<section
						aria-labelledby="boundaries-heading"
						id="boundaries"
						{...props(docsStyles.documentSection)}
					>
						<h2 id="boundaries-heading" {...props(docsStyles.sectionTitle)}>
							Usage boundaries
						</h2>
						<GuidanceTable
							entries={guidance.boundaries}
							kind="boundary"
							label={`${component.name} usage boundaries`}
						/>
					</section>
					<section
						aria-labelledby="api-heading"
						id="api"
						{...props(docsStyles.documentSection)}
					>
						<h2 id="api-heading" {...props(docsStyles.sectionTitle)}>
							API reference
						</h2>
						<p {...props(docsStyles.documentDescription)}>
							Public props from <code>@mizen-labs/ui</code>. Use exported prop
							types for the complete TypeScript contract.
						</p>
						<ComponentApiProperties component={component} />
					</section>
					<Pager {...adjacent} />
				</article>
			</div>
		</main>
	);
}
