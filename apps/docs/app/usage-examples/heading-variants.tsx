import { Heading } from "@mizen/ui";

export function HeadingDisplayHeadingH1Example1() {
	return (
		<Heading level={1} size="display">
			Display heading (h1)
		</Heading>
	);
}
export function HeadingTitleHeadingH2Example2() {
	return (
		<Heading level={2} size="title">
			Title heading (h2)
		</Heading>
	);
}
export function HeadingSectionHeadingH3Example3() {
	return (
		<Heading level={3} size="heading">
			Section heading (h3)
		</Heading>
	);
}
export function HeadingSubsectionHeadingH4DefaultSizeExample4() {
	return <Heading level={4}>Subsection heading (h4, default size)</Heading>;
}
export function HeadingMinorHeadingH5DefaultSizeExample5() {
	return <Heading level={5}>Minor heading (h5, default size)</Heading>;
}
export function HeadingDetailHeadingH6DefaultSizeExample6() {
	return <Heading level={6}>Detail heading (h6, default size)</Heading>;
}
export function HeadingDefaultHeadingDefaultLevel2DefaultSizeExample7() {
	return <Heading>Default heading (default level 2, default size)</Heading>;
}
