import {
	AspectRatio,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	Heading,
	Inline,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { mediaContentStyles } from "../compositions/media-content.styles";

const projects = [
	{
		description:
			"A workspace for reviewing the details that make a component useful.",
		image: {
			alt: "Rows of lavender under a pink evening sky",
			src: "/media/lavender-valensole.jpg",
		},
		name: "Project Alpha",
	},
	{
		description:
			"A shared library for consistent forms, actions, and navigation.",
		image: {
			alt: "Lavender stems in bloom across a green field",
			src: "/media/lavender-bloom.jpg",
		},
		name: "Project Beta",
	},
	{
		description:
			"A reading view that makes room for long names and real content.",
		image: {
			alt: "A bee on a sprig of lavender",
			src: "/media/lavender-bee.jpg",
		},
		name: "Project Gamma",
	},
] as const;
export function CarouselExample1() {
	return (
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
											alt={project.image.alt}
											height={800}
											loading="lazy"
											src={project.image.src}
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
	);
}
