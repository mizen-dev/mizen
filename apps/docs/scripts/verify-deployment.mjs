import assert from "node:assert/strict";

const origin = new URL(process.argv[2] ?? "https://ui.mizen-labs.dev");
async function check(path, type) {
	const response = await fetch(new URL(path, origin));
	assert.equal(response.status, 200, `${path}: HTTP status`);
	assert.ok(
		response.headers.get("content-type")?.includes(type),
		`${path}: content type`
	);
	return response;
}
const document = await check("/docs/components/button/", "text/html");
assert.match(
	document.headers.get("cache-control") ?? "",
	/(?:max-age=0|no-cache)/u
);
const html = await document.text();
const assets = [
	...html.matchAll(/(?:href|src)="(?<asset>[^" ]*\/assets\/[^" ]+)"/gu),
].map((match) => match.groups.asset);
const script = assets.find((path) => path.endsWith(".js"));
assert.ok(script, "HTML references a JavaScript asset");
const asset = await check(script, "javascript");
assert.match(asset.headers.get("cache-control") ?? "", /max-age=31536000/u);
assert.match(asset.headers.get("cache-control") ?? "", /immutable/u);
await asset.body?.cancel();
const markdown = await check(
	"/docs/components/button/markdown",
	"text/markdown"
);
assert.match(await markdown.text(), /Button/u);
const missing = await fetch(
	new URL("/assets/missing-deployment-probe.js", origin)
);
assert.equal(
	missing.status,
	404,
	"Missing assets must not return successful HTML"
);
await missing.body?.cancel();
console.log(
	`Verified HTML, asset caching, markdown, and missing assets on ${origin.origin}`
);
