"use client";

import {
	ActivityFeed,
	ActivityFeedContent,
	ActivityFeedDescription,
	ActivityFeedDetails,
	ActivityFeedHeader,
	ActivityFeedItem,
	ActivityFeedMedia,
	ActivityFeedSummary,
	ActivityFeedTime,
	AvatarCharacter,
	Badge,
	Button,
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
	Heading,
	Link,
	Menu,
	MenuPopup,
	MenuRadioGroup,
	MenuRadioItem,
	MenuTrigger,
	Switch,
	Token,
} from "@mizen/ui";
import { colors } from "@mizen/ui/colors.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { fontSize, fontWeight, lineHeight } from "@mizen/ui/typography.stylex";
import { create, props } from "@stylexjs/stylex";
import { IconCircleFilled, IconFilter, IconTag } from "@tabler/icons-react";
import { useCallback, useId, useState } from "react";

export const activityExampleStyles = create({
	container: { maxWidth: "48rem", minWidth: 0, width: "100%" },
	controls: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
	},
	day: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
		marginBlockEnd: space["2"],
		marginBlockStart: space["4"],
	},
	header: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["4"],
		justifyContent: "space-between",
		marginBlockEnd: space["6"],
	},
	muted: { color: colors.content },
	subject: { color: colors.content, fontWeight: fontWeight.semibold },
	tags: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
	},
	toggle: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		fontSize: fontSize["14"],
		gap: space["2"],
		lineHeight: lineHeight["20"],
	},
});

interface ActivityEvent {
	action: string;
	actor: string;
	actorId: string;
	comment?: string;
	dateTime: string;
	id: string;
	kind: "status" | "comment" | "tags" | "file" | "mention" | "assignment";
	status?: "Completed" | "In progress";
	target?: string;
	time: string;
}
const activityDays: {
	id: string;
	label: string;
	date: string;
	events: ActivityEvent[];
}[] = [
	{
		date: "2026-10-13",
		events: [
			{
				action: "changed",
				actor: "Maya Chen",
				actorId: "member:maya",
				dateTime: "2026-10-13T09:42:00Z",
				id: "complete",
				kind: "status",
				status: "Completed",
				target: "Input states",
				time: "09:42 UTC",
			},
			{
				action: "commented on",
				actor: "Alex Rivera",
				actorId: "member:alex",
				comment:
					"The focus treatment feels much clearer now. Let’s use this spacing across the remaining controls, and check the disabled states in both themes before release.",
				dateTime: "2026-10-13T09:31:00Z",
				id: "comment",
				kind: "comment",
				target: "Input states",
				time: "09:31 UTC",
			},
			{
				action: "added tags",
				actor: "Lina Park",
				actorId: "member:lina",
				dateTime: "2026-10-13T09:18:00Z",
				id: "tags",
				kind: "tags",
				time: "09:18 UTC",
			},
			{
				action: "uploaded",
				actor: "Theo Martin",
				actorId: "member:theo",
				dateTime: "2026-10-13T09:04:00Z",
				id: "file",
				kind: "file",
				target: "input-state-review.csv",
				time: "09:04 UTC",
			},
			{
				action: "mentioned you in",
				actor: "Maya Chen",
				actorId: "member:maya",
				comment:
					"@Sam The keyboard pass is ready for review. Could you check the focus order and disabled controls before we publish?",
				dateTime: "2026-10-13T08:47:00Z",
				id: "mention",
				kind: "mention",
				target: "Release review",
				time: "08:47 UTC",
			},
			{
				action: "assigned",
				actor: "Alex Rivera",
				actorId: "member:alex",
				dateTime: "2026-10-13T08:30:00Z",
				id: "assignment",
				kind: "assignment",
				target: "MIZ-142",
				time: "08:30 UTC",
			},
		],
		id: "today",
		label: "Tuesday, 13 October",
	},
	{
		date: "2026-10-12",
		events: [
			{
				action: "commented on",
				actor: "Lina Park",
				actorId: "member:lina",
				comment:
					"The narrower layout reads well. We should keep the same alignment when the labels wrap to a second line.",
				dateTime: "2026-10-12T16:24:00Z",
				id: "previous-comment",
				kind: "comment",
				target: "Mobile navigation",
				time: "16:24 UTC",
			},
			{
				action: "changed",
				actor: "Theo Martin",
				actorId: "member:theo",
				dateTime: "2026-10-12T15:10:00Z",
				id: "progress",
				kind: "status",
				status: "In progress",
				target: "Mobile navigation",
				time: "15:10 UTC",
			},
		],
		id: "yesterday",
		label: "Monday, 12 October",
	},
];

function ActivityCommentText({ event }: { event: ActivityEvent }) {
	if (event.kind === "mention") {
		return (
			<>
				<Token color="pink" label="@Sam" size="sm" />{" "}
				<span>{event.comment?.replace("@Sam ", "")}</span>
			</>
		);
	}
	return <span>{event.comment}</span>;
}

function ActivityEventDetails({ event }: { event: ActivityEvent }) {
	if (event.comment) {
		return (
			<ActivityFeedDetails>
				<ActivityCommentText event={event} />
			</ActivityFeedDetails>
		);
	}
	if (event.kind === "tags") {
		return (
			<ActivityFeedDescription>
				<span {...props(activityExampleStyles.tags)}>
					<Token
						color="purple"
						icon={<IconTag aria-hidden size={14} />}
						label="Accessibility"
					/>
					<Token color="blue" label="Keyboard" />
				</span>
			</ActivityFeedDescription>
		);
	}
	if (event.kind === "file") {
		return (
			<ActivityFeedDescription>CSV · 4 review checks</ActivityFeedDescription>
		);
	}
	if (event.kind === "assignment") {
		return (
			<ActivityFeedDescription>
				Assigned to{" "}
				<strong {...props(activityExampleStyles.subject)}>Lina Park</strong>
			</ActivityFeedDescription>
		);
	}
	return null;
}

function ActivityEventMedia({ event }: { event: ActivityEvent }) {
	return <AvatarCharacter seed={event.actorId} />;
}
function ActivityEventTarget({ event }: { event: ActivityEvent }) {
	if (!event.target) {
		return null;
	}
	if (event.kind === "assignment") {
		return <Token color="orange" label={event.target} size="sm" />;
	}
	if (event.kind === "file") {
		return (
			<Link download href="/activity-review.csv">
				{event.target}
			</Link>
		);
	}
	return (
		<strong {...props(activityExampleStyles.subject)}>{event.target}</strong>
	);
}

function ActivityEventRow({ event }: { event: ActivityEvent }) {
	return (
		<ActivityFeedItem>
			<ActivityFeedMedia aria-hidden>
				<ActivityEventMedia event={event} />
			</ActivityFeedMedia>
			<ActivityFeedContent>
				<ActivityFeedHeader>
					<ActivityFeedSummary>
						<strong {...props(activityExampleStyles.subject)}>
							{event.actor}
						</strong>{" "}
						<span {...props(activityExampleStyles.muted)}>{event.action}</span>{" "}
						<ActivityEventTarget event={event} />
						{event.status ? (
							<>
								{" "}
								<span {...props(activityExampleStyles.muted)}>to</span>{" "}
								<Badge
									size="sm"
									variant={event.status === "Completed" ? "success" : "info"}
								>
									<IconCircleFilled aria-hidden size={7} />
									{event.status}
								</Badge>
							</>
						) : null}
					</ActivityFeedSummary>
					<ActivityFeedTime dateTime={event.dateTime} title={event.dateTime}>
						{event.time}
					</ActivityFeedTime>
				</ActivityFeedHeader>
				<ActivityEventDetails event={event} />
			</ActivityFeedContent>
		</ActivityFeedItem>
	);
}

export function ReleaseActivity() {
	const mentionsId = useId();
	const [mentionsOnly, setMentionsOnly] = useState(false);
	const [filter, setFilter] = useState("all");
	const clearFilters = useCallback(() => {
		setMentionsOnly(false);
		setFilter("all");
	}, []);
	const groups = activityDays
		.map((day) => ({
			...day,
			events: day.events.filter(
				(event) =>
					(!mentionsOnly || event.kind === "mention") &&
					(filter === "all" ||
						(filter === "comments" ? Boolean(event.comment) : !event.comment))
			),
		}))
		.filter((day) => day.events.length > 0);
	return (
		<section
			aria-label="Project activity"
			{...props(activityExampleStyles.container)}
		>
			<div {...props(activityExampleStyles.header)}>
				<Heading level={3}>Activity log</Heading>
				<div {...props(activityExampleStyles.controls)}>
					<label htmlFor={mentionsId} {...props(activityExampleStyles.toggle)}>
						Mentions only
						<Switch
							checked={mentionsOnly}
							id={mentionsId}
							onCheckedChange={setMentionsOnly}
							size="sm"
						/>
					</label>
					<Menu>
						<MenuTrigger
							render={
								<Button
									aria-label="Filter activity"
									size="icon-sm"
									variant={filter === "all" ? "ghost" : "secondary"}
								/>
							}
						>
							<IconFilter aria-hidden size={18} />
						</MenuTrigger>
						<MenuPopup>
							<MenuRadioGroup onValueChange={setFilter} value={filter}>
								<MenuRadioItem closeOnClick value="all">
									All activity
								</MenuRadioItem>
								<MenuRadioItem closeOnClick value="comments">
									Comments
								</MenuRadioItem>
								<MenuRadioItem closeOnClick value="updates">
									Updates
								</MenuRadioItem>
							</MenuRadioGroup>
						</MenuPopup>
					</Menu>
				</div>
			</div>
			{groups.map((day) => (
				<div key={day.id}>
					<div {...props(activityExampleStyles.day)}>
						<time dateTime={day.date} id={`activity-log-${day.id}`}>
							{day.label}
						</time>
					</div>
					<ActivityFeed
						aria-label={
							day.id === "today" ? "Northstar activity" : "Previous activity"
						}
						variant="timeline"
					>
						{day.events.map((event) => (
							<ActivityEventRow event={event} key={event.id} />
						))}
					</ActivityFeed>
				</div>
			))}
			{groups.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle level={3}>No matching activity</EmptyTitle>
						<EmptyDescription>
							There are no mentions in this activity filter.
						</EmptyDescription>
					</EmptyHeader>
					<Button onClick={clearFilters} variant="outline">
						Clear filters
					</Button>
				</Empty>
			) : null}
		</section>
	);
}
