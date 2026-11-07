"use client";
import {
	ActivityFeed,
	ActivityFeedContent,
	ActivityFeedDescription,
	ActivityFeedDetails,
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
	ErrorState,
	ErrorStateContent,
	ErrorStateDescription,
	ErrorStateHeader,
	ErrorStateTitle,
	Link,
	Skeleton,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { activityExampleStyles } from "./activity-feed";

const events = [
	{
		action: "deployed",
		actor: "Maya Chen",
		actorId: "member:maya",
		dateTime: "2026-10-13T09:42:00Z",
		id: "deployed",
		target: "v0.8 to production",
		time: "09:42 UTC",
	},
	{
		action: "merged",
		actor: "Alex Rivera",
		actorId: "member:alex",
		dateTime: "2026-10-13T09:31:00Z",
		id: "merged",
		target: "fix/input-focus into main",
		time: "09:31 UTC",
	},
	{
		action: "opened",
		actor: "Lina Park",
		actorId: "member:lina",
		dateTime: "2026-10-13T08:10:00Z",
		id: "opened",
		target: "Mobile navigation review",
		time: "08:10 UTC",
	},
] as const;

export function ActivityFeedRecentActivityExample1() {
	return (
		<div {...props(activityExampleStyles.container)}>
			<ActivityFeed aria-label="Compact activity">
				{events.map((event) => (
					<ActivityFeedItem key={event.id}>
						<ActivityFeedMedia>
							<AvatarCharacter seed={event.actorId} />
						</ActivityFeedMedia>
						<ActivityFeedContent>
							<ActivityFeedSummary>
								<strong>{event.actor}</strong>
							</ActivityFeedSummary>
							<ActivityFeedDescription>
								<Badge>{event.action}</Badge> {event.target}
							</ActivityFeedDescription>
						</ActivityFeedContent>
						<ActivityFeedTime dateTime={event.dateTime}>
							{event.time}
						</ActivityFeedTime>
					</ActivityFeedItem>
				))}
			</ActivityFeed>
		</div>
	);
}

export function ActivityFeedGroupedExample() {
	return (
		<div {...props(activityExampleStyles.container)}>
			<Text id="activity-today" size="ui" tone="muted">
				13 October
			</Text>
			<ActivityFeed aria-labelledby="activity-today" variant="timeline">
				<ActivityFeedItem>
					<ActivityFeedMedia aria-hidden>
						<AvatarCharacter seed="member:alex" />
					</ActivityFeedMedia>
					<ActivityFeedContent>
						<ActivityFeedSummary>
							<strong>Alex Rivera</strong> merged the focus fix
						</ActivityFeedSummary>
						<ActivityFeedDescription>
							Input · Reviewed by Maya Chen
						</ActivityFeedDescription>
					</ActivityFeedContent>
					<ActivityFeedTime dateTime="2026-10-13T09:31:00Z">
						09:31 UTC
					</ActivityFeedTime>
				</ActivityFeedItem>
			</ActivityFeed>
			<div {...props(activityExampleStyles.day)}>
				<Text id="activity-yesterday" size="ui" tone="muted">
					12 October
				</Text>
			</div>
			<ActivityFeed aria-labelledby="activity-yesterday" variant="timeline">
				<ActivityFeedItem>
					<ActivityFeedMedia aria-hidden>
						<AvatarCharacter seed="member:maya" />
					</ActivityFeedMedia>
					<ActivityFeedContent>
						<ActivityFeedSummary>
							<strong>Maya Chen</strong> started a design review
						</ActivityFeedSummary>
						<ActivityFeedDescription>
							Check the latest component changes before release.
						</ActivityFeedDescription>
					</ActivityFeedContent>
					<ActivityFeedTime dateTime="2026-10-12T16:00:00Z">
						16:00 UTC
					</ActivityFeedTime>
				</ActivityFeedItem>
			</ActivityFeed>
		</div>
	);
}

export function ActivityFeedWithActionsExample() {
	const [acknowledged, setAcknowledged] = useState(false);
	const acknowledge = useCallback(() => setAcknowledged(true), []);
	return (
		<div {...props(activityExampleStyles.container)}>
			<ActivityFeed aria-label="Review activity">
				<ActivityFeedItem>
					<ActivityFeedMedia>
						<AvatarCharacter seed="member:maya" />
					</ActivityFeedMedia>
					<ActivityFeedContent>
						<ActivityFeedSummary>
							<strong>Maya Chen</strong> requested your review
						</ActivityFeedSummary>
						<ActivityFeedDescription>
							Component accessibility and keyboard states.
						</ActivityFeedDescription>
						<ActivityFeedDetails>
							<Stack gap="2">
								<Text size="ui" tone="muted">
									The changes are ready. Please check the disabled states and
									keyboard focus.
								</Text>
								<Link href="/docs/components/input">
									Open input documentation
								</Link>
							</Stack>
						</ActivityFeedDetails>
						<div>
							<Button
								disabled={acknowledged}
								onClick={acknowledge}
								size="sm"
								variant="outline"
							>
								{acknowledged ? "Acknowledged" : "Acknowledge"}
							</Button>
						</div>
						<Text aria-live="polite" size="ui" tone="muted">
							{acknowledged
								? "Maya’s review request is acknowledged."
								: "Waiting for your review."}
						</Text>
					</ActivityFeedContent>
					<ActivityFeedTime dateTime="2026-10-13T09:42:00Z">
						09:42 UTC
					</ActivityFeedTime>
				</ActivityFeedItem>
			</ActivityFeed>
		</div>
	);
}

export function ActivityFeedEmptyExample() {
	return (
		<div {...props(activityExampleStyles.container)}>
			<Empty>
				<EmptyHeader>
					<EmptyTitle level={3}>No activity yet</EmptyTitle>
					<EmptyDescription>
						Updates will appear here when your team starts working on this
						project.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}

export function ActivityFeedLoadingExample() {
	return (
		<div
			aria-busy="true"
			aria-label="Loading activity"
			role="status"
			{...props(activityExampleStyles.container)}
		>
			<Text size="ui" tone="muted">
				Loading recent activity…
			</Text>
			<ActivityFeed aria-hidden>
				{["first", "second", "third"].map((id) => (
					<ActivityFeedItem key={id}>
						<ActivityFeedMedia>
							<Skeleton shape="circle" />
						</ActivityFeedMedia>
						<ActivityFeedContent>
							<Skeleton />
							<Skeleton />
						</ActivityFeedContent>
					</ActivityFeedItem>
				))}
			</ActivityFeed>
		</div>
	);
}

export function ActivityFeedErrorExample() {
	const [failed, setFailed] = useState(true);
	const retry = useCallback(() => setFailed(false), []);
	return (
		<div {...props(activityExampleStyles.container)}>
			{failed ? (
				<ErrorState>
					<ErrorStateHeader>
						<ErrorStateTitle>Activity couldn’t load</ErrorStateTitle>
						<ErrorStateDescription>
							Your project is safe. Try loading the recent updates again.
						</ErrorStateDescription>
					</ErrorStateHeader>
					<ErrorStateContent>
						<Button onClick={retry} variant="outline">
							Try again
						</Button>
					</ErrorStateContent>
				</ErrorState>
			) : (
				<ActivityFeedRecentActivityExample1 />
			)}
		</div>
	);
}
