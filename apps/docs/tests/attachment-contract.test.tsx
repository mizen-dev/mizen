// @vitest-environment happy-dom

import type { ComponentPropsWithRef, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Attachment,
	AttachmentActions,
	type AttachmentActionsProps,
	AttachmentContent,
	type AttachmentContentProps,
	AttachmentDescription,
	type AttachmentDescriptionProps,
	AttachmentMedia,
	type AttachmentMediaProps,
	AttachmentName,
	type AttachmentNameProps,
	type AttachmentProps,
} from "../../../packages/ui/src/components/attachment/attachment";

const propsSpy = vi.hoisted(() => vi.fn((..._styles: unknown[]) => ({})));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: propsSpy,
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type RequiredProp<T, K extends PropertyKey> = K extends keyof T
	? Record<string, never> extends Pick<T, K>
		? false
		: true
	: false;
type SlotContract<T> = [
	Rejects<T, "className" | "data-slot" | "role" | "style">,
	RequiredProp<T, "children">,
	"ref" extends keyof T ? true : false,
];
type Contract = [
	...SlotContract<AttachmentProps>,
	...SlotContract<AttachmentMediaProps>,
	...SlotContract<AttachmentContentProps>,
	...SlotContract<AttachmentNameProps>,
	...SlotContract<AttachmentDescriptionProps>,
	...SlotContract<AttachmentActionsProps>,
	"href" extends keyof ComponentPropsWithRef<"a"> ? true : false,
];
const contract: Contract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];
const UnsafeAttachment = Attachment as ComponentType<Record<string, unknown>>;

describe("Attachment contract", () => {
	it("renders a static file row with optional preview and caller-owned link action", () => {
		const markup = renderToStaticMarkup(
			<Attachment>
				<AttachmentMedia>
					<span aria-label="Project plan cover" role="img" />
				</AttachmentMedia>
				<AttachmentContent>
					<AttachmentName>project-plan.pdf</AttachmentName>
					<AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
				</AttachmentContent>
				<AttachmentActions>
					<a href="/downloads/project-plan.pdf">Download</a>
				</AttachmentActions>
			</Attachment>
		);

		expect(markup).toContain('<div data-slot="attachment"');
		expect(markup).toContain('data-slot="attachment-media"');
		expect(markup).toContain('data-slot="attachment-content"');
		expect(markup).toContain('data-slot="attachment-name"');
		expect(markup).toContain('data-slot="attachment-description"');
		expect(markup).toContain('data-slot="attachment-actions"');
		expect(markup).toContain('aria-label="Project plan cover"');
		expect(markup).toContain('href="/downloads/project-plan.pdf"');
		expect(markup).toContain("project-plan.pdf");
		expect(markup).toContain("PDF · 2.4 MB");
		expect(markup).not.toContain('role="button"');
		expect(
			propsSpy.mock.calls.some(([style]) =>
				Object.entries({ flexWrap: "wrap", minWidth: 0 }).every(
					([key, value]) => (style as Record<string, unknown>)[key] === value
				)
			)
		).toBe(true);
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({ overflowWrap: "anywhere" }),
			expect.anything()
		);
		expect(contract.every(Boolean)).toBe(true);
	});

	it("allows a text-only attachment and protects component-owned root props", () => {
		const markup = renderToStaticMarkup(
			h(
				UnsafeAttachment,
				{
					className: "unsafe",
					"data-slot": "unsafe",
					role: "button",
					style: { display: "none" },
				},
				<h3>Readme.md</h3>
			)
		);

		expect(markup).toContain('data-slot="attachment"');
		expect(markup).toContain("Readme.md");
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain('role="button"');
		expect(markup).not.toContain("style=");
	});
});
