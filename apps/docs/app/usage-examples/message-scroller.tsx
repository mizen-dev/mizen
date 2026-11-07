"use client";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerSubmit,
	type ComposerValue,
	getComposerText,
	Message,
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerViewport,
	useMessageScroller,
} from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";

const styles = create({
	// The thread and its jump arrow, above the composer.
	body: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		minBlockSize: 0,
		position: "relative",
	},
	composer: { paddingBlockStart: "0.5rem" },
	frame: {
		blockSize: "28rem",
		display: "flex",
		flexDirection: "column",
		inlineSize: "100%",
		maxInlineSize: "36rem",
	},
	load: { alignSelf: "center" },
	padded: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		padding: "1rem",
	},
});

interface Person {
	name: string;
	portrait: string;
}

const maya = { name: "Maya Chen", portrait: "/media/portrait-maya.jpg" };
const alex = { name: "Alex Rivera", portrait: "/media/portrait-alex.jpg" };
const jordan = { name: "Jordan Lee", portrait: "/media/portrait-jordan.jpg" };

interface Post {
	/** Absent for the person reading. */
	from?: Person;
	id: string;
	text: string;
}

function Face({ person }: { person: Person }) {
	const initials = person.name
		.split(" ")
		.map((part) => part[0])
		.join("");
	return (
		<Avatar size="sm">
			<AvatarImage alt={person.name} src={person.portrait} />
			<AvatarFallback aria-label={person.name} role="img">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}

function Row({ post }: { post: Post }) {
	return (
		<MessageScrollerItem messageId={post.id}>
			{post.from ? (
				<Message
					align="start"
					author={post.from.name}
					avatar={<Face person={post.from} />}
					from="user"
				>
					{post.text}
				</Message>
			) : (
				<Message from="user">{post.text}</Message>
			)}
		</MessageScrollerItem>
	);
}

let nextId = 0;
function newId() {
	nextId += 1;
	return `post-${nextId}`;
}

const history: readonly Post[] = [
	{ from: maya, id: "h1", text: "Pushed the container query change for Card." },
	{ from: alex, id: "h2", text: "Pulling it now." },
	{ id: "h3", text: "Nice. I'll check the settings sidebar." },
	{ from: jordan, id: "h4", text: "Visual tests are green on my side." },
];

// What the channel says next, a message every couple of seconds.
const script: readonly Omit<Post, "id">[] = [
	{ from: alex, text: "The sidebar looks right at 390px now." },
	{ from: maya, text: "Can someone check the grid on a tablet?" },
	{
		from: jordan,
		text: "Grid lines up. One card has a long title that wraps to three lines.",
	},
	{ from: maya, text: "That one clamps at two lines in the design." },
	{ from: alex, text: "Merging after lunch unless someone objects." },
];

const replies: readonly Omit<Post, "id">[] = [
	{ from: maya, text: "Agreed, let's do that." },
	{ from: jordan, text: "On it." },
	{ from: alex, text: "Thanks for checking!" },
];

const ARRIVAL_MS = 1800;
const REPLY_MS = 1400;

// The channel's composer. Sending jumps to the latest first, so the
// person sees their message land even if they had scrolled up.
function ChannelComposer({ onSend }: { onSend: (text: string) => void }) {
	const { scrollToEnd } = useMessageScroller();
	const [value, setValue] = useState<ComposerValue>([]);
	const send = useCallback(
		(draft: ComposerValue) => {
			scrollToEnd();
			onSend(getComposerText(draft));
			setValue([]);
		},
		[onSend, scrollToEnd]
	);
	return (
		<div {...props(styles.composer)}>
			<Composer onSubmit={send} onValueChange={setValue} value={value}>
				<ComposerInput
					aria-label="Message #design-review"
					placeholder="Message #design-review"
					render={<textarea />}
				/>
				<ComposerActions>
					<ComposerActionGroup align="end">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		</div>
	);
}

// A team channel. New messages rise in; at the end the view follows them.
// Scroll up and it holds still while the arrow offers the latest.
export function TeamChat() {
	const [posts, setPosts] = useState<readonly Post[]>(history);
	const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
	const replyIndex = useRef(0);
	const post = useCallback((next: Omit<Post, "id">) => {
		setPosts((all) => [...all, { ...next, id: newId() }]);
	}, []);
	// The channel talks for a while once the example is on screen.
	const run = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) {
				return;
			}
			timers.current = script.map((line, index) =>
				setTimeout(() => post(line), ARRIVAL_MS * (index + 1))
			);
			return () => {
				for (const timer of timers.current) {
					clearTimeout(timer);
				}
			};
		},
		[post]
	);
	const send = useCallback(
		(text: string) => {
			post({ text });
			const reply = replies[replyIndex.current % replies.length];
			replyIndex.current += 1;
			if (reply) {
				timers.current.push(setTimeout(() => post(reply), REPLY_MS));
			}
		},
		[post]
	);
	return (
		<div ref={run} {...props(styles.frame)}>
			<MessageScroller>
				<div {...props(styles.body)}>
					<MessageScrollerViewport aria-label="#design-review">
						<div {...props(styles.padded)}>
							<MessageScrollerContent>
								{posts.map((entry) => (
									<Row key={entry.id} post={entry} />
								))}
							</MessageScrollerContent>
						</div>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</div>
				<ChannelComposer onSend={send} />
			</MessageScroller>
		</div>
	);
}

const people = [maya, alex, jordan];
const lines = [
	"Pushed the container query change for Card.",
	"Visual tests are green on my side.",
	"The sidebar looks right at 390px now.",
	"Can someone check the grid on a tablet?",
	"Grid lines up. One card has a long title that wraps to three lines.",
	"That one clamps at two lines in the design.",
	"Merging after lunch unless someone objects.",
	"Ship it.",
];

function archived(index: number): Post {
	return {
		from: people[index % people.length],
		id: `archive-${index}`,
		text: lines[index % lines.length] ?? "",
	};
}

const PAGE = 6;

// Earlier messages load above the ones in view, and the reader's place
// does not move.
export function MessageScrollerHistory() {
	const [first, setFirst] = useState(24);
	const posts = Array.from({ length: 30 - first }, (_, offset) =>
		archived(first + offset)
	);
	const loadEarlier = useCallback(
		() => setFirst((current) => Math.max(0, current - PAGE)),
		[]
	);
	return (
		<div {...props(styles.frame)}>
			<MessageScroller>
				<div {...props(styles.body)}>
					<MessageScrollerViewport aria-label="#design-review history">
						<div {...props(styles.padded)}>
							{first > 0 ? (
								<span {...props(styles.load)}>
									<Button onClick={loadEarlier} size="sm" variant="ghost">
										Load earlier messages
									</Button>
								</span>
							) : null}
							<MessageScrollerContent>
								{posts.map((entry) => (
									<Row key={entry.id} post={entry} />
								))}
							</MessageScrollerContent>
						</div>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</div>
			</MessageScroller>
		</div>
	);
}
