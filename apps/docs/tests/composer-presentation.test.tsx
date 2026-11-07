// @vitest-environment happy-dom
import { act, createElement, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import {
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerStatus,
	ComposerSubmit,
	ComposerToken,
} from "../../../packages/ui/src/components/composer/composer";
import { focusComposerInput } from "../../../packages/ui/src/components/composer/composer-editor";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(value: T) => value,
	defineConsts: <T extends object>(value: T) => value,
	defineMarker: () => ({}),
	defineVars: <T extends object>(value: T) => value,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));
function parse(html: string) {
	const root = document.createElement("div");
	root.innerHTML = html;
	return root;
}
it("renders form semantics and closed slots on the server", () => {
	const tree = parse(
		renderToStaticMarkup(
			<Composer
				data-slot="foreign"
				defaultValue={[{ text: "Hello", type: "text" }]}
				disabled
				name="message"
			>
				<ComposerInput
					aria-label="Draft"
					data-slot="foreign"
					placeholder="Write"
				/>
				<ComposerStatus data-slot="foreign" render={<aside />}>
					Ready
				</ComposerStatus>
				<ComposerActions data-slot="foreign">
					<ComposerActionGroup align="end" data-slot="foreign">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		)
	);
	expect(tree.querySelector('[data-slot="foreign"]')).toBeNull();
	expect(tree.querySelector('[data-slot="composer"]')?.tagName).toBe("FORM");
	const hidden = tree.querySelector<HTMLInputElement>('input[name="message"]');
	expect(hidden?.type).toBe("hidden");
	expect(hidden?.value).toBe("Hello");
	expect(hidden?.disabled).toBe(true);
	const input = tree.querySelector('[data-slot="composer-input"]');
	expect(input?.getAttribute("aria-label")).toBe("Draft");
	expect(input?.getAttribute("aria-multiline")).toBe("true");
	expect(input?.getAttribute("contenteditable")).toBe("false");
	expect(tree.querySelector('[role="status"]')?.tagName).toBe("ASIDE");
	expect(
		tree.querySelector<HTMLButtonElement>('[data-slot="composer-submit"]')
			?.disabled
	).toBe(true);
});
it("keeps token labels, icons and editing boundaries in server output", () => {
	const token = {
		id: "maya",
		kind: "person",
		label: "Maya",
		trigger: "@",
		type: "mention" as const,
	};
	const tree = parse(
		renderToStaticMarkup(
			<>
				<ComposerToken token={token} />
				<ComposerToken icon={<svg />} token={token} variant="chip">
					<strong>Custom</strong>
				</ComposerToken>
			</>
		)
	);
	const tokens = tree.querySelectorAll('[data-slot="composer-token"]');
	expect(tokens[0]?.textContent).toBe("@Maya");
	expect(tokens[1]?.textContent).toBe("Custom");
	for (const node of tokens) {
		expect(node.getAttribute("contenteditable")).toBe("false");
		expect(node.getAttribute("data-kind")).toBe("person");
	}
	expect(
		tokens[1]
			?.querySelector('[data-slot="composer-token-icon"]')
			?.getAttribute("aria-hidden")
	).toBe("true");
});

function framePress(markup: string, cancel = false, phase = "mousedown") {
	const frame = document.createElement("form");
	frame.tabIndex = -1;
	frame.innerHTML = `<textarea data-slot="composer-input"></textarea>${markup}`;
	document.body.append(frame);
	const draft = frame.querySelector<HTMLTextAreaElement>("textarea");
	frame.addEventListener(phase, (pressEvent) => {
		if (cancel) {
			pressEvent.preventDefault();
		}
		focusComposerInput(
			pressEvent as unknown as ReactMouseEvent<HTMLFormElement>,
			phase === "mousedown"
		);
	});
	const target = frame.querySelector("[data-hit]") ?? frame;
	const event = new MouseEvent(phase, { bubbles: true, cancelable: true });
	return { draft, event, frame, press: () => target.dispatchEvent(event) };
}
it.each(["mousedown", "click"])(
	"focuses the draft from frame space on %s",
	(phase) => {
		const fixture = framePress(
			"<div><span data-hit>Blank frame space</span></div>",
			false,
			phase
		);
		try {
			fixture.press();
			expect(document.activeElement).toBe(fixture.draft);
			expect(fixture.event.defaultPrevented).toBe(phase === "mousedown");
		} finally {
			fixture.frame.remove();
		}
	}
);
it.each([
	'<button type="button"><span data-hit>Action</span></button>',
	"<a><span data-hit>Link</span></a>",
	"<label><span data-hit>Label</span></label>",
	"<summary data-hit>Details</summary>",
	"<input data-hit/>",
	"<select data-hit></select>",
	"<textarea data-hit></textarea>",
	'<div contenteditable="false"><span data-hit>Editable owner</span></div>',
	'<div role="button"><span data-hit>Action</span></div>',
	'<div role="combobox" data-hit></div>',
	'<div role="menuitem" data-hit></div>',
	'<div tabindex="0"><span data-hit>Focusable</span></div>',
	'<div data-slot="composer-input"><span data-hit>Draft</span></div>',
])("leaves descendant interaction with its owner: %s", (markup) => {
	const fixture = framePress(markup);
	try {
		fixture.frame.focus();
		fixture.press();
		expect(document.activeElement).toBe(fixture.frame);
		expect(fixture.event.defaultPrevented).toBe(false);
	} finally {
		fixture.frame.remove();
	}
});
it("honors cancellation and draft availability", () => {
	const fixture = framePress("<span data-hit>Space</span>", true);
	try {
		fixture.frame.focus();
		fixture.press();
		expect(document.activeElement).toBe(fixture.frame);
	} finally {
		fixture.frame.remove();
	}
	for (const attribute of ["disabled", "aria-disabled"]) {
		const disabled = framePress("<span data-hit>Space</span>");
		try {
			disabled.draft?.setAttribute(attribute, "true");
			disabled.frame.focus();
			disabled.press();
			expect(document.activeElement).toBe(disabled.frame);
			expect(disabled.event.defaultPrevented).toBe(false);
		} finally {
			disabled.frame.remove();
		}
	}
});
it("allows the frame itself, negative-tabindex space and read-only drafts", () => {
	for (const markup of ["", '<span tabindex="-1" data-hit>Space</span>']) {
		const fixture = framePress(markup);
		try {
			fixture.draft?.setAttribute("readonly", "");
			fixture.press();
			expect(document.activeElement).toBe(fixture.draft);
			expect(fixture.event.defaultPrevented).toBe(true);
		} finally {
			fixture.frame.remove();
		}
	}
});

function focusFromPress(event: ReactMouseEvent<HTMLFormElement>) {
	focusComposerInput(event, true);
}
it("preserves React portal bubbling into the frame", async () => {
	const host = document.createElement("div");
	const portal = document.createElement("div");
	document.body.append(host, portal);
	const root = createRoot(host);
	try {
		await act(() =>
			root.render(
				createElement(
					"form",
					{ onMouseDown: focusFromPress },
					<textarea data-slot="composer-input" />,
					createPortal(<button type="button">Portal action</button>, portal)
				)
			)
		);
		const press = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		await act(() => {
			portal.querySelector("button")?.dispatchEvent(press);
		});
		expect(document.activeElement).toBe(host.querySelector("textarea"));
		expect(press.defaultPrevented).toBe(true);
	} finally {
		await act(() => root.unmount());
		host.remove();
		portal.remove();
	}
});
