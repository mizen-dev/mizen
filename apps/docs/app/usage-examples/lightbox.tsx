import { LightboxGallery } from "@mizen-labs/ui";

const photos = [
	{
		alt: "Rows of lavender running to the horizon in Valensole",
		src: "/media/lavender-valensole.jpg",
	},
	{
		alt: "Lavender stems in bloom, close up",
		src: "/media/lavender-bloom.jpg",
	},
	{
		alt: "A bee on a lavender flower",
		src: "/media/lavender-bee.jpg",
	},
	{
		alt: "Paint swatches fanned out in soft colors",
		src: "/media/palette-swatches.jpg",
	},
];

export function PhotoGallery() {
	return <LightboxGallery aria-label="Lavender study" images={photos} />;
}
