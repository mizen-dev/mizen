import { getAppPageData, renderAppMarkdown } from "./app-data.server";

export function GET(slug: string) {
	const data = getAppPageData(slug);
	return new Response(data ? renderAppMarkdown(data) : "App not found.\n", {
		headers: { "content-type": "text/markdown; charset=utf-8" },
		status: data ? 200 : 404,
	});
}
