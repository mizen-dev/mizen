import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { FileTypeIcon, getFileKind } from "../app/compositions/file-type-icon";

const ICON_CLASS = /class="(?<className>[^"]+)"/u;

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("file-type icons", () => {
	it.each([
		["report.pdf", "application/pdf", "document"],
		["letter.docx", "", "document"],
		[
			"letter.docx",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"document",
		],
		["BUDGET.XLSX", "application/octet-stream", "spreadsheet"],
		["export.csv", "text/plain", "spreadsheet"],
		[
			"download",
			"application/vnd.oasis.opendocument.spreadsheet",
			"spreadsheet",
		],
		["component.tsx", "text/plain", "code"],
		["package.json", "", "code"],
		["download", "application/javascript", "code"],
		["pitch.pptx", "", "presentation"],
		["download", "application/vnd.ms-powerpoint", "presentation"],
		["clip.MOV", "", "video"],
		["download", "video/webm", "video"],
		["notes", "", "document"],
		["archive.zip", "application/zip", "document"],
		["broken.png", "image/png", "document"],
	])("classifies %s (%s) as %s", (name, type, kind) => {
		expect(getFileKind({ name, type })).toBe(kind);
	});

	it("renders five distinct decorative icons with stable geometry", () => {
		const icons = [
			"report.pdf",
			"budget.xlsx",
			"app.tsx",
			"pitch.pptx",
			"clip.mp4",
		].map((name) =>
			renderToStaticMarkup(<FileTypeIcon file={{ name, type: "" }} />)
		);
		expect(new Set(icons.map((icon) => icon.match(ICON_CLASS)?.[1])).size).toBe(
			5
		);
		for (const icon of icons) {
			expect(icon).toContain('aria-hidden="true"');
			expect(icon).toContain('width="24"');
		}
	});
});
