export interface AppDoc {
	description: string;
	/** What to do before the files go into an application. */
	setup: {
		code: string;
		links: { href: string; label: string }[];
		paragraphs: string[];
	};
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
			links: [{ href: "/docs/styling", label: "Styling: token variables" }],
			paragraphs: [
				"init sets up Mizen and writes mizen-theme.css with the Vivid preset. The app also uses Tabler icons. Copy the files into src and render App at the root of your application.",
				"home.tsx is the screen. It has no CSS: Page, Section, Grid and Stack lay it out, so it fits a wide window, a narrow one, and the space beside the sidebar.",
				"app-shell.tsx is the frame around every screen. Mizen has no application shell yet, so the shell is the app's own code and holds the only layout styles. On a narrow screen its navigation moves into a Drawer.",
				"app-shell.styles.ts is StyleX and reads Mizen's token modules. It builds only in an app that compiles StyleX together with the Mizen source. init does not set that up. In an app that init set up, write the same rules in plain CSS with the --mizen-* variables.",
			],
		},
		slug: "dashboard",
		title: "Dashboard",
	},
];

export function getAppDoc(slug: string) {
	return appDocs.find((app) => app.slug === slug);
}
