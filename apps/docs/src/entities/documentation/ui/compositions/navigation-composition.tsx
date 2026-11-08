"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	Button,
	Field,
	FieldLabel,
	Group,
	Heading,
	Input,
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	Section,
	Stack,
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperTitle,
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
import Link from "next/link";
import {
	type ChangeEvent,
	type MouseEvent,
	useCallback,
	useState,
} from "react";
import { PreviewWorkspace } from "../../../../shared/ui/preview-workspace";

export function BreadcrumbExamples() {
	return (
		<PreviewWorkspace title="Workspace resources">
			<Breadcrumb aria-label="Project location">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link href="/docs" />}>
							Components
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Navigation and progress</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Heading level={4}>Navigation and progress</Heading>
			<Text size="ui" tone="muted">
				Patterns for finding your place, moving through records, and completing
				a task.
			</Text>
		</PreviewWorkspace>
	);
}

export function PaginationExamples() {
	const [page, setPage] = useState(1);
	const selectPage = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		setPage(Number(event.currentTarget.dataset.page));
	}, []);
	return (
		<PreviewWorkspace
			description="Northstar launch / Shared documents"
			title="Project documents"
		>
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
		</PreviewWorkspace>
	);
}

const projectSteps = [
	{ description: "Choose a name and workspace.", title: "Details" },
	{ description: "Invite the people you work with.", title: "Members" },
	{ description: "Check the project before publishing.", title: "Review" },
] as const;

function getStepStatus(index: number, current: number) {
	if (index === current) {
		return "current";
	}
	return index < current ? "complete" : "upcoming";
}

export function StepperExamples() {
	const [step, setStep] = useState(0);
	const [details, setDetails] = useState({
		email: "",
		name: "Northstar launch",
		workspace: "Product team",
	});
	const changeDetails = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget;
		setDetails((current) => ({ ...current, [name]: value }));
	}, []);
	const goBack = useCallback(() => setStep((current) => current - 1), []);
	const goForward = useCallback(() => setStep((current) => current + 1), []);
	return (
		<PreviewWorkspace
			description="Set up a shared space for your next release."
			title="Create a project"
		>
			<Stepper aria-label="Project setup">
				{projectSteps.map(({ description, title }, index) => (
					<StepperItem key={title} status={getStepStatus(index, step)}>
						<StepperIndicator>{index + 1}</StepperIndicator>
						<StepperTitle>{title}</StepperTitle>
						<StepperDescription>{description}</StepperDescription>
					</StepperItem>
				))}
			</Stepper>
			{step === 0 ? (
				<Stack gap="6">
					<Field>
						<FieldLabel>Project name</FieldLabel>
						<Input name="name" onChange={changeDetails} value={details.name} />
					</Field>
					<Field>
						<FieldLabel>Workspace</FieldLabel>
						<Input
							name="workspace"
							onChange={changeDetails}
							value={details.workspace}
						/>
					</Field>
				</Stack>
			) : null}
			{step === 1 ? (
				<Field>
					<FieldLabel>Invite by email</FieldLabel>
					<Input
						name="email"
						onChange={changeDetails}
						placeholder="teammate@example.com"
						type="email"
						value={details.email}
					/>
				</Field>
			) : null}
			{step === 2 ? (
				<Stack gap="2">
					<Text>
						{details.name || "Your project"} will be created in the{" "}
						{details.workspace || "selected"} workspace.
					</Text>
					<Text size="ui" tone="muted">
						{details.email
							? `Invite ${details.email} to this project.`
							: "No invitations added."}
					</Text>
				</Stack>
			) : null}
			<Text
				aria-live="polite"
				data-testid="stepper-status"
				size="ui"
				tone="muted"
			>
				<span {...props(typographyStyles.tabularNums)}>
					Step {step + 1} of 3: {projectSteps[step]?.title}
				</span>
			</Text>
			<Group>
				<Button disabled={step === 0} onClick={goBack} variant="secondary">
					Back
				</Button>
				<Button disabled={step === 2} onClick={goForward}>
					Continue
				</Button>
			</Group>
		</PreviewWorkspace>
	);
}

export function NavigationComposition() {
	return (
		<Section aria-labelledby="navigation-heading">
			<Heading id="navigation-heading" level={2} size="title">
				Navigation and progress
			</Heading>
			<Heading level={3}>Breadcrumb</Heading>
			<BreadcrumbExamples />
			<Heading level={3}>Pagination</Heading>
			<PaginationExamples />
			<Heading level={3}>Stepper</Heading>
			<StepperExamples />
		</Section>
	);
}
