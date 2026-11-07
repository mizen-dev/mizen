import { getGuide, renderGuideMarkdown } from "../../../guides";

export async function GET(
	_request: Request,
	{
		params,
	}: {
		params: Promise<{ guide: string }>;
	}
) {
	const { guide: slug } = await params;
	const guide = getGuide(slug);
	return new Response(
		guide ? renderGuideMarkdown(guide) : "Guide not found.\n",
		{
			headers: { "content-type": "text/markdown; charset=utf-8" },
			status: guide ? 200 : 404,
		}
	);
}
