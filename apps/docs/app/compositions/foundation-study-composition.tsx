"use client";

import {
	Badge,
	Button,
	Card,
	CardPanel,
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
	Fieldset,
	FieldsetLegend,
	Heading,
	Input,
	Menu,
	MenuItem,
	MenuPopup,
	MenuTrigger,
	Radio,
	RadioGroup,
	Section,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTab,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { foundationStudyStyles } from "./foundation-study.styles";

const workItems = [
	{
		name: "Quarterly plan",
		owner: "Maya Chen",
		status: "Ready",
	},
	{
		name: "Audit export",
		owner: "Theo Martin",
		status: "In review",
	},
	{
		name: "Billing review",
		owner: "Lina Park",
		status: "Blocked",
	},
] as const;

const statusVariants = {
	Blocked: "destructive",
	"In review": "warning",
	Ready: "success",
} as const;

function WorkTable({ context }: { context: string }) {
	return (
		<>
			<div {...props(foundationStudyStyles.tableScrollHint)}>
				<Text size="ui" tone="muted">
					Swipe horizontally to see all columns.
				</Text>
			</div>
			<TableContainer aria-label={`${context} work items`}>
				<div {...props(foundationStudyStyles.tableContent)}>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Work item</TableHead>
								<TableHead>Owner</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{workItems.map((item) => (
								<TableRow key={item.name}>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.owner}</TableCell>
									<TableCell>
										<Badge variant={statusVariants[item.status]}>
											{item.status}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</TableContainer>
		</>
	);
}

function FoundationControls() {
	return (
		<Stack gap="3">
			<div {...props(foundationStudyStyles.actions)}>
				<Button variant="default">Default</Button>
				<Button variant="brand">Brand</Button>
				<Button variant="outline">Outline</Button>
			</div>
			<div {...props(foundationStudyStyles.controlPair)}>
				<Field>
					<FieldLabel>Owner</FieldLabel>
					<Input defaultValue="Maya Chen" />
					<FieldDescription>Editable assignment.</FieldDescription>
				</Field>
				<Field invalid>
					<FieldLabel>Invalid email</FieldLabel>
					<Input defaultValue="alex@" invalid />
					<FieldError match>Enter a valid email address.</FieldError>
				</Field>
				<Field>
					<Select
						defaultValue="ready"
						items={[
							{ label: "Ready", value: "ready" },
							{ label: "In review", value: "review" },
						]}
					>
						<SelectLabel>Status</SelectLabel>
						<SelectTrigger aria-label="Status">
							<SelectValue />
						</SelectTrigger>
						<SelectPopup>
							<SelectItem value="ready">Ready</SelectItem>
							<SelectItem value="review">In review</SelectItem>
						</SelectPopup>
					</Select>
				</Field>
				<Field>
					<Select
						defaultValue="product"
						items={[{ label: "Product team", value: "product" }]}
						readOnly
					>
						<SelectLabel>Team</SelectLabel>
						<SelectTrigger aria-label="Read-only team">
							<SelectValue />
						</SelectTrigger>
						<SelectPopup>
							<SelectItem value="product">Product team</SelectItem>
						</SelectPopup>
					</Select>
					<FieldDescription>Set by an administrator.</FieldDescription>
				</Field>
			</div>
			<div {...props(foundationStudyStyles.choices)}>
				<div {...props(foundationStudyStyles.choice)}>
					<Field>
						<FieldLabel>
							<Checkbox defaultChecked />
							Keep assigned
						</FieldLabel>
					</Field>
				</div>
				<div {...props(foundationStudyStyles.choice)}>
					<Fieldset>
						<FieldsetLegend>Digest</FieldsetLegend>
						<RadioGroup aria-label="Digest frequency" defaultValue="weekly">
							<Field>
								<FieldLabel>
									<Radio value="weekly" />
									Weekly
								</FieldLabel>
							</Field>
							<Field>
								<FieldLabel>
									<Radio value="daily" />
									Daily
								</FieldLabel>
							</Field>
						</RadioGroup>
					</Fieldset>
				</div>
				<div {...props(foundationStudyStyles.choice)}>
					<Field>
						<FieldLabel>
							<Switch defaultChecked />
							Alerts on
						</FieldLabel>
					</Field>
				</div>
			</div>
			<Tabs defaultValue="overview">
				<TabsList aria-label="Work item view">
					<TabsTab value="overview">Overview</TabsTab>
					<TabsTab value="activity">Activity</TabsTab>
				</TabsList>
				<TabsPanel value="overview">
					<Stack gap="1">
						<Text>Current work</Text>
						<Text>Three tasks across planning, operations, and billing.</Text>
					</Stack>
				</TabsPanel>
				<TabsPanel value="activity">
					<Stack gap="1">
						<Text>Recent updates</Text>
						<Text>Maya updated the quarterly plan today.</Text>
					</Stack>
				</TabsPanel>
			</Tabs>
			<div {...props(foundationStudyStyles.actions)}>
				<Menu>
					<MenuTrigger render={<Button variant="outline">Actions</Button>} />
					<MenuPopup>
						<MenuItem>Duplicate work item</MenuItem>
						<MenuItem>Move to project</MenuItem>
					</MenuPopup>
				</Menu>
				<Dialog>
					<DialogTrigger
						render={<Button variant="outline">Open details</Button>}
					/>
					<DialogPopup size="sm">
						<DialogHeader>
							<DialogTitle>Work item details</DialogTitle>
							<DialogDescription>
								Quarterly planning · due 14 October.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Close</Button>} />
						</DialogFooter>
					</DialogPopup>
				</Dialog>
			</div>
		</Stack>
	);
}

function SurfaceSample({ matte = false }: { matte?: boolean }) {
	const content = (
		<Stack gap="3">
			<FoundationControls />
			<WorkTable context={matte ? "Matte workarea" : "Canvas"} />
		</Stack>
	);

	return matte ? (
		<Card>
			<CardPanel>{content}</CardPanel>
		</Card>
	) : (
		<div {...props(foundationStudyStyles.context)}>{content}</div>
	);
}

export function FoundationStudy() {
	return (
		<Section
			aria-labelledby="foundation-study-heading"
			id="foundation-study"
			{...props(foundationStudyStyles.section)}
		>
			<Stack gap="3">
				<div>
					<Heading id="foundation-study-heading" level={2} size="title">
						Foundation study
					</Heading>
					<Text>Same controls and work items on two surfaces.</Text>
				</div>
				<div {...props(foundationStudyStyles.comparison)}>
					<div {...props(foundationStudyStyles.context)}>
						<Heading level={3} size="heading">
							Canvas
						</Heading>
						<SurfaceSample />
					</div>
					<div>
						<Heading level={3} size="heading">
							Matte workarea
						</Heading>
						<SurfaceSample matte />
					</div>
				</div>
			</Stack>
		</Section>
	);
}
