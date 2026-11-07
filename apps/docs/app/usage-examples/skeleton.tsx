import { Skeleton, Stack } from "@mizen-labs/ui";

export function LoadingProjectCard() {
	return (
		<Stack aria-busy="true" aria-label="Loading project summary">
			<Skeleton shape="rectangle" />
			<Skeleton />
			<Skeleton />
		</Stack>
	);
}
