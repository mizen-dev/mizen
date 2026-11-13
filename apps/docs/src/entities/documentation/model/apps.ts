export interface AppDoc {
	description: string;
	/** What to do before the files go into an application. */
	setup: { code: string; paragraphs: string[] };
	slug: string;
	title: string;
}

// An app is a whole screen built from Mizen components, with its sources.
export const appDocs: AppDoc[] = [
	{
		description:
			"A store overview in an application shell: metrics, a table with selection, and two charts, in the Vivid theme.",
		setup: {
			code: `npx @mizen-labs/cli@latest init --preset vivid --yes
npm install @tabler/icons-react`,
			paragraphs: [
				"init sets up Mizen and writes mizen-theme.css with the Vivid preset. The app also uses Tabler icons. Copy the files into src and render App at the root of your application.",
				"home.tsx is the screen. It has no CSS: Page, Section, Grid and Stack lay it out, so it fits a wide window, a narrow one, and the space beside the sidebar.",
				"app-shell.tsx is the frame around every screen. Mizen has no application shell yet, so the shell is the app's own code and holds the only layout CSS. On a narrow screen its navigation moves into a Drawer.",
			],
		},
		slug: "dashboard",
		title: "Dashboard",
	},
];

export function getAppDoc(slug: string) {
	return appDocs.find((app) => app.slug === slug);
}
