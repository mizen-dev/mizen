import { getComponentDoc } from "../../../../docs-registry";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug } = await params;
	const component = getComponentDoc(slug);
	if (!component) {
		return new Response("Component not found.\n", { status: 404 });
	}
	return Response.json(component);
}
