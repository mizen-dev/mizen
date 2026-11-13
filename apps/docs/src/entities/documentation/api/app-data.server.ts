import { getAppDoc } from "../model/apps";
import dashboardApp from "../ui/apps/dashboard/app.tsx?raw";
import dashboardShellStyles from "../ui/apps/dashboard/app-shell.styles.ts?raw";
import dashboardShell from "../ui/apps/dashboard/app-shell.tsx?raw";
import dashboardData from "../ui/apps/dashboard/data.ts?raw";
import dashboardHome from "../ui/apps/dashboard/home.tsx?raw";

// Each app's files in reading order, at the paths they take in an application.
const files: Record<string, { code: string; path: string }[]> = {
	dashboard: [
		{ code: dashboardApp, path: "src/app.tsx" },
		{ code: dashboardHome, path: "src/home.tsx" },
		{ code: dashboardShell, path: "src/app-shell.tsx" },
		{ code: dashboardShellStyles, path: "src/app-shell.styles.ts" },
		{ code: dashboardData, path: "src/data.ts" },
	],
};

export function getAppPageData(slug: string) {
	const app = getAppDoc(slug);
	return app ? { app, files: files[slug] ?? [] } : null;
}

type AppPageData = NonNullable<ReturnType<typeof getAppPageData>>;

const language = (path: string) => path.slice(path.lastIndexOf(".") + 1);

export function renderAppMarkdown({ app, files: sources }: AppPageData) {
	return [
		`# ${app.title}`,
		app.description,
		`Live: /apps/${app.slug}/preview`,
		"## Set up",
		`\`\`\`sh\n${app.setup.code}\n\`\`\``,
		...app.setup.paragraphs,
		app.setup.links
			.map(({ href, label }) => `- [${label}](${href}/markdown)`)
			.join("\n"),
		"## Files",
		...sources.flatMap(({ code, path }) => [
			`### ${path}`,
			`\`\`\`${language(path)}\n${code.trimEnd()}\n\`\`\``,
		]),
		"",
	].join("\n\n");
}
