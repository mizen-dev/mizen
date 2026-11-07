"use client";
import { Skeleton, Stack } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "../components/[slug]/specimens/specimen.styles";

export function SkeletonLoadingAProjectExample1() {
	return (
		<Stack gap="4">
			<div {...props(specimenStyles.identity)}>
				<Skeleton shape="circle" />
				<Stack gap="1">
					<Skeleton />
					<Skeleton />
				</Stack>
			</div>
			<Skeleton shape="rectangle" />
			<Stack gap="2">
				<Skeleton />
				<Skeleton />
				<Skeleton />
			</Stack>
		</Stack>
	);
}
export function SkeletonTextBlockExample2() {
	return (
		<Stack gap="4">
			<Stack>
				<Skeleton />
				<Skeleton />
				<Skeleton />
			</Stack>
		</Stack>
	);
}
export function SkeletonCircleWithMetadataExample3() {
	return (
		<Stack gap="4">
			<div {...props(specimenStyles.identity)}>
				<Skeleton shape="circle" />
				<Stack gap="1">
					<Skeleton />
					<Skeleton />
				</Stack>
			</div>
		</Stack>
	);
}
export function SkeletonRectangleCardPreviewExample4() {
	return (
		<Stack gap="4">
			<Stack>
				<Skeleton shape="rectangle" />
				<Skeleton />
				<Skeleton />
			</Stack>
		</Stack>
	);
}
