"use client";

import {
	ActivityFeed,
	ActivityFeedContent,
	ActivityFeedItem,
	ActivityFeedMedia,
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
	Heading,
	ListActions,
	Section,
	Stack,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTab,
	Text,
	Timestamp,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";
import { compositionStyles } from "./composition.styles";

interface Notification {
	id: string;
	initials: string;
	message: string;
	name: string;
	read: boolean;
	time: string;
}

type Filter = "all" | "unread";

const initialNotifications: Notification[] = [
	{
		id: "comment",
		initials: "MC",
		message: "Mentioned you in “Homepage review”",
		name: "Maya Chen",
		read: false,
		time: "2026-10-09T09:20:00Z",
	},
	{
		id: "assignment",
		initials: "TM",
		message: "Assigned you a task in “Mobile onboarding”",
		name: "Theo Martin",
		read: false,
		time: "2026-10-08T15:45:00Z",
	},
	{
		id: "approval",
		initials: "LP",
		message: "Approved your update to “Release plan”",
		name: "Lina Park",
		read: true,
		time: "2026-10-07T11:10:00Z",
	},
];

function NotificationItem({
	notification,
	onMarkRead,
}: {
	notification: Notification;
	onMarkRead: (id: string) => void;
}) {
	const handleMarkRead = useCallback(
		() => onMarkRead(notification.id),
		[notification.id, onMarkRead]
	);

	return (
		<ActivityFeedItem>
			<ActivityFeedMedia>
				<Avatar aria-label={notification.name}>
					<AvatarFallback>{notification.initials}</AvatarFallback>
				</Avatar>
			</ActivityFeedMedia>
			<ActivityFeedContent>
				<Stack gap="1">
					<Text>
						<strong>{notification.name}</strong>
					</Text>
					<p {...props(compositionStyles.sectionDescription)}>
						{notification.message}
					</p>
					<Timestamp dateTime={notification.time} />
				</Stack>
			</ActivityFeedContent>
			{notification.read ? null : (
				<ListActions>
					<Button
						aria-label={`Mark “${notification.message}” as read`}
						onClick={handleMarkRead}
						size="sm"
						variant="ghost"
					>
						Mark read
					</Button>
				</ListActions>
			)}
		</ActivityFeedItem>
	);
}

function NotificationList({
	notifications,
	onMarkRead,
}: {
	notifications: Notification[];
	onMarkRead: (id: string) => void;
}) {
	if (notifications.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle level={3}>You’re all caught up</EmptyTitle>
					<EmptyDescription>
						No unread notifications in this example.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<ActivityFeed aria-label="Notifications">
			{notifications.map((notification) => (
				<NotificationItem
					key={notification.id}
					notification={notification}
					onMarkRead={onMarkRead}
				/>
			))}
		</ActivityFeed>
	);
}

function NotificationCenterSurface({
	notifications,
	filter,
	onFilterChange,
	onMarkRead,
	onMarkAllRead,
}: {
	notifications: Notification[];
	filter: Filter;
	onFilterChange: (filter: Filter) => void;
	onMarkRead: (id: string) => void;
	onMarkAllRead: () => void;
}) {
	const allTabRef = useRef<HTMLButtonElement | null>(null);
	const unreadTabRef = useRef<HTMLButtonElement | null>(null);
	const unreadNotifications = notifications.filter(
		(notification) => !notification.read
	);
	const unreadCount = unreadNotifications.length;
	const returnFocusToFilter = useCallback(() => {
		requestAnimationFrame(() => {
			(filter === "unread" ? unreadTabRef : allTabRef).current?.focus();
		});
	}, [filter]);
	const handleMarkAllRead = useCallback(() => {
		onMarkAllRead();
		returnFocusToFilter();
	}, [onMarkAllRead, returnFocusToFilter]);
	const handleFilterChange = useCallback(
		(value: string | null) => {
			if (value === "all" || value === "unread") {
				onFilterChange(value);
			}
		},
		[onFilterChange]
	);
	const handleMarkRead = useCallback(
		(id: string) => {
			onMarkRead(id);
			returnFocusToFilter();
		},
		[onMarkRead, returnFocusToFilter]
	);

	return (
		<Stack gap="3">
			<div {...props(compositionStyles.header)}>
				<p {...props(compositionStyles.sectionDescription)}>
					{unreadCount} unread notifications
				</p>
				<Button
					disabled={unreadCount === 0}
					onClick={handleMarkAllRead}
					variant="ghost"
				>
					Mark all read
				</Button>
			</div>
			<Tabs onValueChange={handleFilterChange} value={filter}>
				<TabsList aria-label="Notification filter">
					<TabsTab ref={allTabRef} value="all">
						All <Badge variant="secondary">{notifications.length}</Badge>
					</TabsTab>
					<TabsTab ref={unreadTabRef} value="unread">
						Unread <Badge variant="secondary">{unreadCount}</Badge>
					</TabsTab>
				</TabsList>
				<TabsPanel value="all">
					<NotificationList
						notifications={notifications}
						onMarkRead={handleMarkRead}
					/>
				</TabsPanel>
				<TabsPanel value="unread">
					<NotificationList
						notifications={unreadNotifications}
						onMarkRead={handleMarkRead}
					/>
				</TabsPanel>
			</Tabs>
		</Stack>
	);
}

export function NotificationCenterExamples() {
	const [notifications, setNotifications] = useState(initialNotifications);
	const [filter, setFilter] = useState<Filter>("all");
	const [notice, setNotice] = useState("");
	const unreadCount = notifications.filter(
		(notification) => !notification.read
	).length;
	const handleMarkAllRead = useCallback(() => {
		setNotifications((current) =>
			current.map((notification) => ({ ...notification, read: true }))
		);
		setNotice(
			unreadCount === 1
				? "1 notification marked as read."
				: `${unreadCount} notifications marked as read.`
		);
	}, [unreadCount]);
	const handleMarkRead = useCallback(
		(id: string) => {
			const notification = notifications.find((item) => item.id === id);
			setNotifications((current) =>
				current.map((item) => (item.id === id ? { ...item, read: true } : item))
			);
			if (notification) {
				setNotice(`Marked “${notification.message}” as read.`);
			}
		},
		[notifications]
	);

	return (
		<div
			{...props(
				compositionStyles.workspace,
				compositionStyles.compactWorkspace
			)}
		>
			<Section
				aria-labelledby="notification-center-heading"
				data-testid="notification-center-example"
			>
				<div {...props(compositionStyles.intro)}>
					<Heading id="notification-center-heading" level={2} size="title">
						Notification center
					</Heading>
					<p {...props(compositionStyles.sectionDescription)}>
						Review updates and manage what still needs your attention.
					</p>
				</div>
				<NotificationCenterSurface
					filter={filter}
					notifications={notifications}
					onFilterChange={setFilter}
					onMarkAllRead={handleMarkAllRead}
					onMarkRead={handleMarkRead}
				/>
				<div
					aria-live="polite"
					{...props(
						compositionStyles.status,
						compositionStyles.sectionDescription
					)}
				>
					{notice}
				</div>
			</Section>
		</div>
	);
}
