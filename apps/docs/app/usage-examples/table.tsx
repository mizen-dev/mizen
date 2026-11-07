import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@mizen/ui";

export function ProjectTable() {
	return (
		<TableContainer aria-label="Projects" scroll="horizontal">
			<Table>
				<TableCaption>Current projects and their owners.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead scope="col">Project</TableHead>
						<TableHead scope="col">Owner</TableHead>
						<TableHead numeric scope="col">
							Open issues
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableHead scope="row">Design system</TableHead>
						<TableCell>Maya Chen</TableCell>
						<TableCell numeric>4</TableCell>
					</TableRow>
					<TableRow>
						<TableHead scope="row">Documentation</TableHead>
						<TableCell>Alex Rivera</TableCell>
						<TableCell numeric>2</TableCell>
					</TableRow>
					<TableRow>
						<TableHead scope="row">Reference app</TableHead>
						<TableCell>Jordan Lee</TableCell>
						<TableCell numeric>7</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</TableContainer>
	);
}
