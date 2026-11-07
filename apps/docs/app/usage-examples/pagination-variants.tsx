"use client";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Text,
} from "@mizen-labs/ui";
import { typographyStyles } from "@mizen-labs/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { type MouseEvent, useCallback, useState } from "react";

export function PaginationProjectDocumentsExample1() {
	const [page, setPage] = useState(1);
	const selectPage = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		setPage(Number(event.currentTarget.dataset.page));
	}, []);
	return (
		<Stack gap="4">
			<TableContainer aria-label="Project documents">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Document</TableHead>
							<TableHead>Owner</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from(
							{ length: 10 },
							(_, index) => (page - 1) * 10 + index + 1
						).map((record) => (
							<TableRow key={record}>
								<TableCell>
									Release note {String(record).padStart(2, "0")}
								</TableCell>
								<TableCell>
									{record % 2 ? "Maya Chen" : "Alex Morgan"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Text aria-live="polite" data-testid="pagination-status">
				<span {...props(typographyStyles.tabularNums)}>
					Showing records {(page - 1) * 10 + 1}–{page * 10} of 30
				</span>
			</Text>
			<Pagination aria-label="Record pages">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							data-page={page - 1}
							disabled={page === 1}
							href={`?page=${page - 1}`}
							onClick={selectPage}
						/>
					</PaginationItem>
					{[1, 2, 3].map((number) => (
						<PaginationItem key={number}>
							<PaginationLink
								active={page === number}
								aria-label={`Page ${number}`}
								data-page={number}
								href={`?page=${number}`}
								onClick={selectPage}
							>
								{number}
							</PaginationLink>
						</PaginationItem>
					))}
					<PaginationItem>
						<PaginationNext
							data-page={page + 1}
							disabled={page === 3}
							href={`?page=${page + 1}`}
							onClick={selectPage}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</Stack>
	);
}
