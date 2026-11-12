"use client";

import {
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
	FieldLabel,
	Heading,
	Input,
	List,
	ListContent,
	ListItem,
	Text,
} from "@mizen-labs/ui";

const plainBox = { border: "5px solid", padding: 10, width: 100 };
// A fixed width, so the page margin the reset removes does not resize it.
const mizenBox = { width: 480 };

// The same markup renders with and without the reset. The application's own
// markup shows what the reset changes; the Mizen markup must not change.
export function ResetProbe() {
	return (
		<main>
			<section data-testid="app-markup">
				<h2>Plain heading</h2>
				<p>
					Plain paragraph with a <a href="#plain-link">plain link</a>.
				</p>
				<ul>
					<li>Plain list item</li>
				</ul>
				<button type="button">Plain button</button>
				<input aria-label="Plain input" defaultValue="Plain" />
				<input aria-label="Plain checkbox" type="checkbox" />
				<div data-testid="plain-box" style={plainBox} />
			</section>
			<section data-testid="mizen-markup" style={mizenBox}>
				<Heading level={2}>Mizen heading</Heading>
				<Text>Mizen text</Text>
				<List aria-label="Mizen list">
					<ListItem>
						<ListContent>Mizen list item</ListContent>
					</ListItem>
				</List>
				<Button>Mizen button</Button>
				<Button nativeButton={false} render={<a href="#mizen-link" />}>
					Mizen link button
				</Button>
				<Field name="probe">
					<FieldLabel>Mizen input</FieldLabel>
					<Input defaultValue="Mizen" />
				</Field>
				<Checkbox aria-label="Mizen checkbox" />
				<Dialog>
					<DialogTrigger
						render={<Button variant="outline">Open dialog</Button>}
					/>
					<DialogPopup size="sm">
						<DialogHeader>
							<DialogTitle>Mizen dialog</DialogTitle>
							<DialogDescription>Overlay content.</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose render={<Button>Done</Button>} />
						</DialogFooter>
					</DialogPopup>
				</Dialog>
			</section>
		</main>
	);
}
