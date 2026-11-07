import {
	AspectRatio,
	Carousel,
	CarouselContent,
	CarouselIndicators,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	Inline,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { carouselPreviewStyles as styles } from "./carousel-preview.styles";

const photos = [
	{
		alt: "Rows of lavender running to the horizon in Valensole",
		src: "/media/lavender-valensole.jpg",
	},
	{
		alt: "Lavender stems in bloom, close up",
		src: "/media/lavender-bloom.jpg",
	},
	{ alt: "A bee on a lavender flower", src: "/media/lavender-bee.jpg" },
	{
		alt: "Paint swatches fanned out in soft colors",
		src: "/media/palette-swatches.jpg",
	},
];

export function ProjectCarousel() {
	return (
		<div {...props(styles.root)}>
			<Carousel aria-label="Lavender field photos">
				<CarouselContent>
					{photos.map((photo, index) => (
						<CarouselItem
							aria-label={`${index + 1} of ${photos.length}`}
							key={photo.src}
						>
							<AspectRatio ratio={3 / 2}>
								{/* biome-ignore lint/performance/noImgElement: A native image keeps the example framework-neutral. */}
								{/* biome-ignore lint/correctness/useImageSize: AspectRatio sizes the crop, so the photo fills it. */}
								<img alt={photo.alt} src={photo.src} {...props(styles.image)} />
							</AspectRatio>
						</CarouselItem>
					))}
				</CarouselContent>
				<div {...props(styles.controls)}>
					<CarouselIndicators aria-label="Photos" />
					<Inline>
						<CarouselPrevious aria-label="Previous photo" />
						<CarouselNext aria-label="Next photo" />
					</Inline>
				</div>
			</Carousel>
		</div>
	);
}
