import { AspectRatio } from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { mediaContentStyles } from "../compositions/media-content.styles";

export function ProjectPreview() {
	return (
		<AspectRatio ratio={4 / 3}>
			{/* biome-ignore lint/performance/noImgElement: A native image keeps the example framework-neutral. */}
			<img
				alt="Rows of lavender in Valensole under a clear sky"
				height={800}
				src="/media/lavender-valensole.jpg"
				width={1200}
				{...props(mediaContentStyles.image, mediaContentStyles.rounded)}
			/>
		</AspectRatio>
	);
}
