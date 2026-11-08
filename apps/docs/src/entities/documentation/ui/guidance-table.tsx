import {
	Badge,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { docsStyles } from "../../../shared/ui/docs.styles";

export function GuidanceTable({
	entries,
	kind,
	label,
}: {
	entries: readonly string[];
	kind: "recommendation" | "boundary";
	label: string;
}) {
	return (
		<TableContainer aria-label={label}>
			<Table>
				<colgroup>
					<col {...props(docsStyles.guidanceColumn)} />
					<col />
				</colgroup>
				<TableHeader sticky={false}>
					<TableRow>
						<TableHead>Guidance</TableHead>
						<TableHead>
							{kind === "recommendation" ? "Practice" : "Boundary"}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{entries.map((text) => (
						<TableRow key={text}>
							<TableCell>
								<Badge
									size="sm"
									variant={kind === "recommendation" ? "success" : "brand"}
								>
									{kind === "recommendation" ? "Do" : "Scope"}
								</Badge>
							</TableCell>
							<TableCell>
								<p {...props(docsStyles.guidanceText)}>{text}</p>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
