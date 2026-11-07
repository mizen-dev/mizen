"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Checkbox,
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Heading,
	Input,
	List,
	ListActions,
	ListContent,
	ListItem,
	Section,
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetClose,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPopup,
	SheetTitle,
	Stack,
	Text,
} from "@mizen/ui";
import {
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
} from "@mizen/ui/property-list";
import { typographyStyles } from "@mizen/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import {
	type ChangeEvent,
	type RefObject,
	useCallback,
	useRef,
	useState,
} from "react";
import { compositionStyles } from "./composition.styles";
import { DemoDisclosure } from "./demo-disclosure";

type ProjectStatus = "active" | "paused";
interface Project {
	id: string;
	name: string;
	owner: string;
	status: ProjectStatus;
	updated: string;
}
const seedProjects: Project[] = [
	{
		id: "prj-104",
		name: "Northstar launch",
		owner: "Mila Petrova",
		status: "active",
		updated: "Today, 10:42",
	},
	{
		id: "prj-103",
		name: "Customer research — Q4",
		owner: "Алексей Смирнов",
		status: "active",
		updated: "Yesterday",
	},
	{
		id: "prj-102",
		name: "Интеграция с партнёрами",
		owner: "",
		status: "paused",
		updated: "Oct 2, 2026",
	},
	{
		id: "prj-101",
		name: "A long-running internationalization and accessibility review",
		owner: "Mizen Studio operations team",
		status: "active",
		updated: "Sep 28, 2026",
	},
];
const demoModes = {
	empty: "Empty collection",
	error: "Error",
	loaded: "Loaded",
	loading: "Loading",
} as const;
const demoModeItems = Object.entries(demoModes).map(([value, label]) => ({
	label,
	value,
}));
const projectStatusItems = [
	{ label: "Active", value: "active" },
	{ label: "Paused", value: "paused" },
];
const filterStatusItems = [
	{ label: "All statuses", value: "all" },
	...projectStatusItems,
];

function matchesProject(project: Project, query: string, status: string) {
	return (
		(status === "all" || project.status === status) &&
		`${project.name} ${project.owner} ${project.id}`
			.toLocaleLowerCase()
			.includes(query.toLocaleLowerCase())
	);
}

function ProjectMetadata({ project }: { project: Project }) {
	return (
		<PropertyList>
			<PropertyListItem>
				<PropertyListLabel>Owner</PropertyListLabel>
				<PropertyListValue>
					{project.owner || "No owner assigned"}
				</PropertyListValue>
			</PropertyListItem>
			<PropertyListItem>
				<PropertyListLabel>Project ID</PropertyListLabel>
				<PropertyListValue>{project.id}</PropertyListValue>
			</PropertyListItem>
			<PropertyListItem>
				<PropertyListLabel>Updated</PropertyListLabel>
				<PropertyListValue>{project.updated}</PropertyListValue>
			</PropertyListItem>
		</PropertyList>
	);
}

function ProjectRow({
	project,
	selected,
	onToggle,
	onEdit,
}: {
	project: Project;
	selected: boolean;
	onToggle: (id: string, checked: boolean) => void;
	onEdit: (project: Project) => void;
}) {
	const handleToggle = useCallback(
		(checked: boolean) => onToggle(project.id, checked),
		[onToggle, project.id]
	);
	const handleEdit = useCallback(() => onEdit(project), [onEdit, project]);

	return (
		<ListItem>
			<ListContent>
				<Heading level={3} size="subheading">
					{project.name}
				</Heading>
				<Text size="ui" tone="muted">
					{project.owner || "No owner assigned"} · Updated {project.updated}
				</Text>
			</ListContent>
			<ListActions>
				<Checkbox
					aria-label={`Select ${project.name}`}
					checked={selected}
					onCheckedChange={handleToggle}
				/>
				<Badge variant={project.status === "active" ? "success" : "warning"}>
					{project.status === "active" ? "Active" : "Paused"}
				</Badge>
				<Button
					aria-label={`Edit ${project.name}`}
					onClick={handleEdit}
					variant="outline"
				>
					Edit
				</Button>
			</ListActions>
		</ListItem>
	);
}

function ProjectList({
	projects,
	selected,
	onToggle,
	onEdit,
}: {
	projects: Project[];
	selected: string[];
	onToggle: (id: string, checked: boolean) => void;
	onEdit: (project: Project) => void;
}) {
	return (
		<List aria-label="Projects">
			{projects.map((project) => (
				<ProjectRow
					key={project.id}
					onEdit={onEdit}
					onToggle={onToggle}
					project={project}
					selected={selected.includes(project.id)}
				/>
			))}
		</List>
	);
}

function ProjectEditor({
	open,
	project,
	draft,
	pending,
	nameError,
	transportError,
	message,
	onClose,
	onDiscard,
	onNameChange,
	onStatusChange,
	onSave,
	nameInputRef,
}: {
	open: boolean;
	project: Project | null;
	draft: Project | null;
	pending: boolean;
	nameError: string;
	transportError: string;
	message: string;
	onClose: () => void;
	onDiscard: () => void;
	onNameChange: (name: string) => void;
	onStatusChange: (status: ProjectStatus) => void;
	onSave: () => void;
	nameInputRef: RefObject<HTMLInputElement | null>;
}) {
	const [confirmDiscard, setConfirmDiscard] = useState(false);
	const dirty = Boolean(
		project &&
			draft &&
			(project.name !== draft.name || project.status !== draft.status)
	);
	const requestClose = useCallback(() => {
		if (dirty) {
			setConfirmDiscard(true);
		} else {
			onClose();
		}
	}, [dirty, onClose]);
	const handleSheetOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!(nextOpen || pending)) {
				requestClose();
			}
		},
		[pending, requestClose]
	);
	const handleDiscard = useCallback(() => {
		onDiscard();
		setConfirmDiscard(false);
	}, [onDiscard]);
	const handleNameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onNameChange(event.currentTarget.value);
		},
		[onNameChange]
	);
	const handleStatusChange = useCallback(
		(value: string | null) => {
			if (value === "active" || value === "paused") {
				onStatusChange(value);
			}
		},
		[onStatusChange]
	);
	const handleConfirmOpenChange = useCallback((nextOpen: boolean) => {
		setConfirmDiscard(nextOpen);
	}, []);

	return (
		<>
			<Sheet onOpenChange={handleSheetOpenChange} open={open}>
				<SheetPopup closeProps={{ disabled: pending }} side="right">
					{draft ? (
						<Stack>
							<SheetHeader>
								<SheetTitle>Project details</SheetTitle>
								<SheetDescription>
									Inspect and edit a single project.
								</SheetDescription>
							</SheetHeader>
							<ProjectMetadata project={draft} />
							<Field disabled={pending} invalid={Boolean(nameError)}>
								<FieldLabel>Project name</FieldLabel>
								<Input
									disabled={pending}
									invalid={Boolean(nameError)}
									onChange={handleNameChange}
									ref={nameInputRef}
									value={draft.name}
								/>
								<FieldDescription>
									Names stay attached to this project ID.
								</FieldDescription>
								<FieldError match>{nameError}</FieldError>
							</Field>
							<Field disabled={pending}>
								<FieldLabel>Status</FieldLabel>
								<Select
									disabled={pending}
									items={projectStatusItems}
									onValueChange={handleStatusChange}
									value={draft.status}
								>
									<SelectTrigger aria-label="Project status">
										<SelectValue />
									</SelectTrigger>
									<SelectPopup>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="paused">Paused</SelectItem>
									</SelectPopup>
								</Select>
							</Field>
							<div aria-live="polite" {...props(compositionStyles.status)}>
								{message || transportError}
							</div>
							<SheetFooter>
								<SheetClose
									disabled={pending}
									render={<Button variant="outline">Close</Button>}
								/>
								<Button disabled={pending} loading={pending} onClick={onSave}>
									Save project
								</Button>
							</SheetFooter>
						</Stack>
					) : null}
				</SheetPopup>
			</Sheet>
			<Dialog onOpenChange={handleConfirmOpenChange} open={confirmDiscard}>
				<DialogPopup size="sm">
					<DialogHeader>
						<DialogTitle>Discard project changes?</DialogTitle>
						<DialogDescription>
							Your edits to this project will be lost.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose
							render={<Button variant="outline">Keep editing</Button>}
						/>
						<Button onClick={handleDiscard} variant="destructive">
							Discard changes
						</Button>
					</DialogFooter>
				</DialogPopup>
			</Dialog>
		</>
	);
}

function ProjectStateMessage({
	mode,
	visibleCount,
	totalCount,
	selectedCount,
	onRetry,
}: {
	mode: keyof typeof demoModes;
	visibleCount: number;
	totalCount: number;
	selectedCount: number;
	onRetry: () => void;
}) {
	if (mode === "loading") {
		return <>Loading projects…</>;
	}
	if (mode === "error") {
		return (
			<Alert variant="error">
				<AlertTitle>Could not load projects</AlertTitle>
				<AlertDescription>
					Your search and status filters are preserved.{" "}
					<Button onClick={onRetry} variant="outline">
						Retry
					</Button>
				</AlertDescription>
			</Alert>
		);
	}
	if (mode === "empty") {
		return (
			<Alert>
				<AlertTitle>No projects are available</AlertTitle>
			</Alert>
		);
	}
	if (totalCount === 0) {
		return (
			<Alert>
				<AlertTitle>No projects remain</AlertTitle>
				<AlertDescription>
					There are no projects in this collection.
				</AlertDescription>
			</Alert>
		);
	}
	if (visibleCount === 0) {
		return (
			<Alert>
				<AlertTitle>No matching projects</AlertTitle>
				<AlertDescription>
					Try changing the search or status filter.
				</AlertDescription>
			</Alert>
		);
	}
	return (
		<span {...props(typographyStyles.tabularNums)}>
			{visibleCount} of {totalCount} projects · {selectedCount} selected
		</span>
	);
}

export function RecordsComposition({
	showExamples = false,
}: {
	showExamples?: boolean;
} = {}) {
	const [records, setRecords] = useState(seedProjects);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("all");
	const [selected, setSelected] = useState<string[]>([]);
	const [mode, setMode] = useState<keyof typeof demoModes>("loaded");
	const [active, setActive] = useState<Project | null>(null);
	const [draft, setDraft] = useState<Project | null>(null);
	const [confirmArchive, setConfirmArchive] = useState(false);
	const [pending, setPending] = useState(false);
	const [nameError, setNameError] = useState("");
	const [transportError, setTransportError] = useState("");
	const [message, setMessage] = useState("");
	const [pageMessage, setPageMessage] = useState("");
	const nameInputRef = useRef<HTMLInputElement>(null);
	const attempts = useRef(0);
	const visible = records.filter((project) =>
		matchesProject(project, query, status)
	);

	const toggleSelected = useCallback((id: string, checked: boolean) => {
		setSelected((current) => {
			if (checked) {
				return current.includes(id) ? current : [...current, id];
			}
			return current.filter((item) => item !== id);
		});
	}, []);
	const beginEdit = useCallback((project: Project) => {
		setActive(project);
		setDraft(project);
		setNameError("");
		setTransportError("");
		setMessage("");
	}, []);
	const closeEdit = useCallback(() => {
		setActive(null);
		setDraft(null);
		setNameError("");
		setTransportError("");
		setMessage("");
	}, []);
	const handleNameChange = useCallback(
		(name: string) => {
			if (pending) {
				return;
			}
			setDraft((current) => (current ? { ...current, name } : current));
			setNameError("");
		},
		[pending]
	);
	const handleStatusChange = useCallback(
		(nextStatus: ProjectStatus) => {
			if (pending) {
				return;
			}
			setDraft((current) =>
				current ? { ...current, status: nextStatus } : current
			);
		},
		[pending]
	);
	const saveDraft = useCallback(async () => {
		if (pending || !draft) {
			return;
		}
		if (!draft.name.trim()) {
			setNameError("Project name is required.");
			requestAnimationFrame(() => nameInputRef.current?.focus());
			return;
		}
		setNameError("");
		setTransportError("");
		setPending(true);
		setMessage("Saving project…");
		try {
			await new Promise((resolve) => setTimeout(resolve, 250));
			attempts.current += 1;
			if (showExamples && attempts.current === 1) {
				setMessage("");
				setTransportError(
					"Could not save your changes. Your draft is preserved. Try again."
				);
				return;
			}
			setRecords((current) =>
				current.map((record) => (record.id === draft.id ? draft : record))
			);
			setPageMessage("Project saved.");
			closeEdit();
		} catch {
			setMessage("");
			setTransportError(
				"The project could not be saved. Your draft is preserved."
			);
		} finally {
			setPending(false);
		}
	}, [closeEdit, draft, pending, showExamples]);
	const archiveSelected = useCallback(() => {
		if (selected.length === 0) {
			return;
		}
		setRecords((current) =>
			current.filter((project) => !selected.includes(project.id))
		);
		setSelected([]);
		setConfirmArchive(false);
		setPageMessage(
			`${selected.length} ${selected.length === 1 ? "project" : "projects"} archived.`
		);
	}, [selected]);
	const handleDemoModeChange = useCallback((value: string | null) => {
		if (value && value in demoModes) {
			setMode(value as keyof typeof demoModes);
		}
	}, []);
	const handleArchiveOpenChange = useCallback((nextOpen: boolean) => {
		setConfirmArchive(nextOpen);
	}, []);
	const handleSearchChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setQuery(event.currentTarget.value);
		},
		[]
	);
	const handleFilterChange = useCallback((value: string | null) => {
		setStatus(value ?? "all");
	}, []);
	const handleRetryLoad = useCallback(() => {
		setMode("loaded");
		setPageMessage("Projects loaded. Your filters are still applied.");
	}, []);
	const canArchive = mode === "loaded" && selected.length > 0 && !pending;

	return (
		<div {...props(compositionStyles.workspace)}>
			<Section aria-labelledby="records-heading">
				<div {...props(compositionStyles.header)}>
					<div>
						<Heading id="records-heading" level={2} size="title">
							Projects
						</Heading>
						<p {...props(compositionStyles.sectionDescription)}>
							Manage your team's projects, ownership, and access.
						</p>
					</div>
					<Dialog onOpenChange={handleArchiveOpenChange} open={confirmArchive}>
						<DialogTrigger
							disabled={!canArchive}
							render={
								<Button disabled={!canArchive} variant="outline">
									Archive selected ({selected.length})
								</Button>
							}
						/>
						<DialogPopup size="sm">
							<DialogHeader>
								<DialogTitle>
									Archive {selected.length}{" "}
									{selected.length === 1 ? "project" : "projects"}?
								</DialogTitle>
								<DialogDescription>
									This removes the selected records from the local sample list.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose
									render={<Button variant="outline">Cancel</Button>}
								/>
								<Button onClick={archiveSelected} variant="destructive">
									Archive projects
								</Button>
							</DialogFooter>
						</DialogPopup>
					</Dialog>
				</div>
				<div {...props(compositionStyles.controls)}>
					<Field>
						<FieldLabel>Search projects</FieldLabel>
						<Input
							onChange={handleSearchChange}
							placeholder="Name, owner, or ID"
							value={query}
						/>
					</Field>
					<Field>
						<FieldLabel>Status</FieldLabel>
						<Select
							items={filterStatusItems}
							onValueChange={handleFilterChange}
							value={status}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectPopup>
								<SelectItem value="all">All statuses</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="paused">Paused</SelectItem>
							</SelectPopup>
						</Select>
					</Field>
				</div>
				{pageMessage ? (
					<div aria-live="polite" {...props(compositionStyles.status)}>
						{pageMessage}
					</div>
				) : null}
				<div aria-live="polite" {...props(compositionStyles.status)}>
					<ProjectStateMessage
						mode={mode}
						onRetry={handleRetryLoad}
						selectedCount={selected.length}
						totalCount={records.length}
						visibleCount={visible.length}
					/>
				</div>
				{mode === "loaded" && visible.length > 0 ? (
					<ProjectList
						onEdit={beginEdit}
						onToggle={toggleSelected}
						projects={visible}
						selected={selected}
					/>
				) : null}
				<ProjectEditor
					draft={draft}
					message={message}
					nameError={nameError}
					nameInputRef={nameInputRef}
					onClose={closeEdit}
					onDiscard={closeEdit}
					onNameChange={handleNameChange}
					onSave={saveDraft}
					onStatusChange={handleStatusChange}
					open={active !== null}
					pending={pending}
					project={active}
					transportError={transportError}
				/>
				{showExamples ? (
					<DemoDisclosure title="Preview collection states">
						<Text size="ui" tone="muted">
							This local collection previews loading, empty, and error states.
						</Text>
						<Field>
							<FieldLabel>Collection state</FieldLabel>
							<Select
								items={demoModeItems}
								onValueChange={handleDemoModeChange}
								value={mode}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectPopup>
									<SelectItem value="loaded">Loaded</SelectItem>
									<SelectItem value="loading">Loading</SelectItem>
									<SelectItem value="error">Error</SelectItem>
									<SelectItem value="empty">Empty collection</SelectItem>
								</SelectPopup>
							</Select>
						</Field>
					</DemoDisclosure>
				) : null}
			</Section>
		</div>
	);
}
