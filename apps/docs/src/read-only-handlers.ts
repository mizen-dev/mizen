// Match the original docs endpoints; Start otherwise falls through to HTML.
export const readOnlyHandlers = {
	ANY: () => new Response(null, { status: 405 }),
	OPTIONS: () =>
		new Response(null, {
			headers: { Allow: "GET, HEAD, OPTIONS" },
			status: 204,
		}),
};
