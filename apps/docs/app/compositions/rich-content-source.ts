export const markdownSource = [
	"### Release notes",
	"",
	"The shared **reading layout** is ready for review. Keep long technical identifiers readable: `workspace.permissions.auditTrail`.",
	"",
	"- [x] Native links stay keyboard accessible.",
	"- [ ] Long content wraps at narrow widths.",
	"",
	"| Capability | Behavior |",
	"| --- | --- |",
	"| Tables | Use shared Mizen table styles. |",
	"| Footnotes | Keep references linked to their notes. |",
	"",
	"> Keep rendered content semantic and easy to scan.",
	"",
	"~~~tsx",
	'import { Field, FieldControl, FieldLabel, Input } from "@mizen/ui";',
	'const audit = await workspace.permissions.auditTrail.filter((entry) => entry.actor === "current-user" && entry.action === "settings.updated" && entry.resource === "workspace.preferences.notifications");',
	'export const releaseStatus = "ready";',
	"~~~",
	"",
	"Read the [release guide](https://example.com/releases/2026-10). Details live in the footnote[^release].",
	"",
	"[^release]: This note stays connected to its reference.",
].join("\n");

export const richContentImage = {
	alt: "Rows of lavender under a pink evening sky",
	src: "/media/lavender-valensole.jpg",
} as const;

export const richContentDateTime = "2026-10-07T09:00:00Z";
