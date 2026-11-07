"use client";

import { Skeleton, Stack } from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function SkeletonSpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection
				description="The project summary keeps its place while content loads."
				primary
				title="Loading a project"
			>
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
			</SpecimenSection>

			<SpecimenSection
				description="Composes multiple line skeletons to simulate paragraph loading."
				title="Text block"
			>
				<Stack>
					<Skeleton />
					<Skeleton />
					<Skeleton />
				</Stack>
			</SpecimenSection>

			<SpecimenSection
				description="Pairs an avatar or icon placeholder with descriptive metadata lines."
				title="Circle with metadata"
			>
				<div {...props(specimenStyles.identity)}>
					<Skeleton shape="circle" />
					<Stack gap="1">
						<Skeleton />
						<Skeleton />
					</Stack>
				</div>
			</SpecimenSection>

			<SpecimenSection
				description="Provides a block placeholder for media, cards, and container surfaces."
				title="Rectangle card preview"
			>
				<Stack>
					<Skeleton shape="rectangle" />
					<Skeleton />
					<Skeleton />
				</Stack>
			</SpecimenSection>
		</Stack>
	);
}
