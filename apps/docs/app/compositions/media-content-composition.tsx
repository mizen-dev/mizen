import {
	AspectRatio,
	Blockquote,
	BlockquoteAttribution,
	BlockquoteContent,
	Button,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	Citation,
	Heading,
	Inline,
	Lightbox,
	LightboxDescription,
	LightboxImage,
	LightboxPopup,
	LightboxTitle,
	LightboxTrigger,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { PreviewWorkspace } from "../components/preview-workspace";
import { mediaContentStyles } from "./media-content.styles";

const projects = [
	{
		description:
			"A workspace for reviewing the details that make a component useful.",
		name: "Project Alpha",
	},
	{
		description:
			"A shared library for consistent forms, actions, and navigation.",
		name: "Project Beta",
	},
	{
		description:
			"A reading view that makes room for long names and real content.",
		name: "Project Gamma",
	},
] as const;

export function AspectRatioExamples() {
	return (
		<PreviewWorkspace
			testId="aspect-ratio-example"
			title="Media proportions"
			titleId="aspect-ratio-heading"
		>
			<Stack gap="3">
				<div {...props(mediaContentStyles.preview)}>
					<AspectRatio ratio={16 / 9}>
						{/* biome-ignore lint/performance/noImgElement: A native image keeps the example framework-neutral. */}
						<img
							alt="Rows of lavender under a pink evening sky"
							height={800}
							loading="lazy"
							src="/media/lavender-valensole.jpg"
							width={1200}
							{...props(mediaContentStyles.image)}
						/>
					</AspectRatio>
				</div>
			</Stack>
		</PreviewWorkspace>
	);
}

export function CarouselExamples() {
	return (
		<PreviewWorkspace
			testId="carousel-example"
			title="Project studies"
			titleId="carousel-heading"
		>
			<Stack gap="3">
				<Carousel aria-label="Project studies">
					<Stack gap="3">
						<CarouselContent>
							{projects.map((project) => (
								<CarouselItem aria-label={project.name} key={project.name}>
									<div {...props(mediaContentStyles.study)}>
										<Stack gap="2">
											<AspectRatio ratio={16 / 9}>
												{/* biome-ignore lint/performance/noImgElement: A native image keeps the example framework-neutral. */}
												<img
													alt="Rows of lavender under a pink evening sky"
													height={800}
													loading="lazy"
													src="/media/lavender-valensole.jpg"
													width={1200}
													{...props(mediaContentStyles.image)}
												/>
											</AspectRatio>
											<Heading level={3} size="heading">
												{project.name}
											</Heading>
											<Text>{project.description}</Text>
										</Stack>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<Inline>
							<CarouselPrevious />
							<CarouselNext />
						</Inline>
					</Stack>
				</Carousel>
			</Stack>
		</PreviewWorkspace>
	);
}

export function LightboxExamples() {
	return (
		<PreviewWorkspace
			testId="lightbox-example"
			title="Image preview"
			titleId="lightbox-heading"
		>
			<Stack gap="3">
				<Lightbox>
					<div {...props(mediaContentStyles.preview)}>
						<AspectRatio ratio={16 / 9}>
							{/* biome-ignore lint/performance/noImgElement: A native image keeps the example framework-neutral. */}
							<img
								alt="Rows of lavender under a pink evening sky"
								height={800}
								loading="lazy"
								src="/media/lavender-valensole.jpg"
								width={1200}
								{...props(mediaContentStyles.image)}
							/>
						</AspectRatio>
					</div>
					<LightboxTrigger
						render={<Button variant="outline">Open image preview</Button>}
					/>
					<LightboxPopup>
						<LightboxTitle>Lavender study</LightboxTitle>
						<LightboxDescription>
							Lavender rows in Valensole, France, at dusk.
						</LightboxDescription>
						<LightboxImage
							alt="Rows of lavender under a pink evening sky"
							height={800}
							src="/media/lavender-valensole.jpg"
							width={1200}
						/>
					</LightboxPopup>
				</Lightbox>
			</Stack>
		</PreviewWorkspace>
	);
}

export function BlockquoteExamples() {
	return (
		<PreviewWorkspace
			testId="blockquote-example"
			title="Quoted content"
			titleId="blockquote-heading"
		>
			<Stack gap="3">
				<Blockquote>
					<BlockquoteContent>
						Whenever the system can safely determine a UI decision from context,
						it should determine it instead of exposing another choice.
					</BlockquoteContent>
					<BlockquoteAttribution>
						<Citation>Mizen UI architecture</Citation>
					</BlockquoteAttribution>
				</Blockquote>
			</Stack>
		</PreviewWorkspace>
	);
}

export function CitationExamples() {
	return (
		<PreviewWorkspace
			testId="citation-example"
			title="Source titles"
			titleId="citation-heading"
		>
			<Stack gap="3">
				<Text>
					The composition rules in <Citation>Mizen UI architecture</Citation>{" "}
					keep routine styling decisions inside the library.
				</Text>
			</Stack>
		</PreviewWorkspace>
	);
}

export function MediaContentComposition() {
	return (
		<Stack gap="4">
			<AspectRatioExamples />
			<CarouselExamples />
			<LightboxExamples />
			<BlockquoteExamples />
			<CitationExamples />
		</Stack>
	);
}
