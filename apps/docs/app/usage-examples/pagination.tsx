import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@mizen-labs/ui";
import NextLink from "next/link";
export function SearchResultsPagination() {
	return (
		<Pagination aria-label="Search results pages">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="/components/pagination?page=1" />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						aria-label="Page 1"
						href="/components/pagination?page=1"
					>
						1
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						active
						aria-current="page"
						aria-label="Page 2"
						href="/components/pagination?page=2"
					>
						2
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						aria-label="Page 3"
						href="/components/pagination?page=3"
					>
						3
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationEllipsis />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						aria-label="Page 10"
						href="/components/pagination?page=10"
					>
						10
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="/components/pagination?page=3" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}

export function PaginationFrameworkLinks() {
	return (
		<Pagination aria-label="Framework pages" dir="rtl">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious disabled />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						active
						aria-label="Page 1"
						render={<NextLink href="?page=1" />}
					>
						1
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink
						aria-label="Page 2"
						render={<NextLink href="?page=2" />}
					>
						2
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext render={<NextLink href="?page=2" />} />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
