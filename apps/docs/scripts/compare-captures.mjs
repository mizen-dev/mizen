// Builds a before/after sheet from two capture directories made by
// capture-component-previews.mjs, listing only captures that changed. Usage:
//   node scripts/compare-captures.mjs <before-dir> <after-dir> <out.png>
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { chromium } from "playwright";

const [beforeDir, afterDir, out] = process.argv.slice(2);
if (!(beforeDir && afterDir && out)) {
	throw new Error(
		"Usage: compare-captures.mjs <before-dir> <after-dir> <out.png>"
	);
}
const before = new Set(await readdir(resolve(beforeDir)));
const unchanged = async (name) =>
	before.has(name) &&
	(await readFile(resolve(beforeDir, name))).equals(
		await readFile(resolve(afterDir, name))
	);
const pngs = (await readdir(resolve(afterDir)))
	.filter((name) => name.endsWith(".png"))
	.sort();
const same = await Promise.all(pngs.map(unchanged));
const names = pngs.filter((_, index) => !same[index]);
const cell = (path) =>
	path
		? `<img src="file://${path}" style="max-width:560px;width:100%">`
		: '<span style="color:#999">new</span>';
const rows = names.map(
	(name) =>
		`<tr><td style="padding:8px;vertical-align:top;font:12px system-ui">${basename(name, ".png")}</td><td style="padding:8px">${cell(before.has(name) && resolve(beforeDir, name))}</td><td style="padding:8px">${cell(resolve(afterDir, name))}</td></tr>`
);
const html = `<html><body style="margin:16px;background:#fff"><table style="border-collapse:collapse"><tr><th></th><th>Before</th><th>After</th></tr>${rows.join("")}</table></body></html>`;
const sheet = `${out}.html`;
await writeFile(sheet, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
await page.goto(`file://${resolve(sheet)}`, { waitUntil: "load" });
await page.screenshot({ fullPage: true, path: out });
await browser.close();
console.log(`${names.length} of ${pngs.length} captures changed: ${out}`);
