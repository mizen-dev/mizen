import { AspectRatio, Stack } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { mediaContentStyles } from "../compositions/media-content.styles";

export function AspectRatioMediaProportionsExample1() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
