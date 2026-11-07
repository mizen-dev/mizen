import { Inline, Thumbnail } from "@mizen/ui";

const photos = [
	{
		alt: "Rows of lavender in Valensole",
		src: "/media/lavender-valensole.jpg",
	},
	{ alt: "Lavender stems in bloom", src: "/media/lavender-bloom.jpg" },
	{ alt: "A bee on a lavender flower", src: "/media/lavender-bee.jpg" },
	{ alt: "Paint swatches in soft colors", src: "/media/palette-swatches.jpg" },
];

export function PhotoThumbnails() {
	return (
		<Inline>
			{photos.map((photo) => (
				<Thumbnail alt={photo.alt} key={photo.src} size="lg" src={photo.src} />
			))}
		</Inline>
	);
}
