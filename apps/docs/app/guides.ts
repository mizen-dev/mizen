import { cliGuide } from "./cli-guide";
import { componentCategories, componentDocs } from "./docs-registry";
import { hookGuides } from "./hook-guides";

interface GuideSection {
	code?: { title?: string; value: string };
	id: string;
	links?: { label: string; href: string }[];
	paragraphs: string[];
	title: string;
}

export interface Guide {
	description: string;
	/** Guides outside Getting started, such as hooks, list under this group. */
	group?: "Hooks";
	sections: GuideSection[];
	slug: string;
	title: string;
}

export const guides: Guide[] = [
	{
		description:
			"A React component library for product interfaces, with fixed defaults, closed styling, and docs that agents can read.",
		sections: [
			{
				id: "what",
				links: [
					{ href: "/docs/installation", label: "Installation" },
					{ href: "/docs/components/button", label: "Browse components" },
				],
				paragraphs: [
					`Mizen is a React component library for product interfaces: forms, data, charts, overlays, and agent workflows. It has ${componentDocs.length} components in ${componentCategories.length} groups, including Layout, Agentic, and Diagrams.`,
					"Base UI provides behavior and accessibility. StyleX provides styles, compiled to atomic CSS at build time. Each component page declares Stable or Preview status. Diagram is Preview.",
				],
				title: "What Mizen is",
			},
			{
				id: "principles",
				links: [
					{ href: "/docs/styling", label: "Styling" },
					{ href: "/docs/accessibility", label: "Accessibility" },
					{ href: "/docs/for-agents", label: "For agents" },
				],
				paragraphs: [
					"Few fixed defaults. Each component has one considered look. You choose variants and sizes through props, not by restyling.",
					"Closed styling. Components accept no className or style. Their appearance stays consistent and upgrades stay safe.",
					"Accessible by contract. Keyboard behavior follows WAI-ARIA patterns. Components that need a name, such as charts and trees, refuse to render without one.",
					"Ready for agents. Every page has a Markdown version with its usage, anatomy, and API, so a coding agent can use Mizen without guessing.",
				],
				title: "Principles",
			},
			{
				id: "stack",
				paragraphs: [
					"React 19, Base UI, and StyleX. Data components use TanStack Form, Table, Charts, and Virtual. Icons come from Tabler by default, behind one module, so another icon pack can replace it.",
				],
				title: "Built on",
			},
			{
				id: "status",
				paragraphs: [
					"@mizen-labs/ui 0.1.0 is available on npm. Before 1.0, minor versions can change the API.",
				],
				title: "Status",
			},
		],
		slug: "introduction",
		title: "Introduction",
	},
	{
		description:
			"Install Mizen from npm and use its compiled stylesheet in Next, TanStack Start, or React + Vite.",
		sections: [
			{
				code: {
					value: "npm install @mizen-labs/ui",
				},
				id: "install",
				links: [{ href: "/docs/cli", label: "CLI setup and diagnostics" }],
				paragraphs: [
					"Install @mizen-labs/ui in an existing React app. Apps in the Mizen monorepo can use workspace:* instead.",
					"React and ReactDOM must satisfy ^19.2.8. Import @mizen-labs/ui/styles.css once at the application root. It contains the compiled atomic styles; components load their own structural CSS. No consumer Babel or PostCSS setup is required.",
				],
				title: "Install from npm",
			},
			{
				code: {
					title: "next.config.mjs",
					value: `export default { transpilePackages: ["@mizen-labs/ui"] };`,
				},
				id: "next",
				links: [
					{ href: "/docs/theming#bootstrap", label: "Theme and font layout" },
				],
				paragraphs: [
					"Transpile the package: its components import their own CSS files. Then render ThemeScript and ThemeProvider in the root layout.",
				],
				title: "Next",
			},
			{
				code: {
					title: "app/globals.css",
					value: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
}`,
				},
				id: "stylesheet",
				paragraphs: [
					"Import @mizen-labs/ui/styles.css before your app stylesheet in the root layout. The theming guide shows the complete Next layout; the root route below shows TanStack Start.",
					"Your app owns its document defaults. Set your interface font on body; Mizen controls inherit it.",
				],
				title: "Global stylesheet",
			},
			{
				code: {
					title: "src/main.tsx",
					value: `import "@mizen-labs/ui/styles.css";
import { ThemeProvider } from "@mizen-labs/ui/theme";
import { initializeTheme } from "@mizen-labs/ui/theme/initialize";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

initializeTheme();
createRoot(document.getElementById("root")!).render(
  <ThemeProvider><StrictMode><App /></StrictMode></ThemeProvider>
);`,
				},
				id: "react-vite",
				paragraphs: [
					"The default create-vite React template works without special Vite configuration. Import Mizen CSS in src/main.tsx or src/main.jsx, call initializeTheme before createRoot, and wrap the mounted tree in ThemeProvider. Keep existing StrictMode, application providers, and CSS.",
					"JavaScript omits the TypeScript non-null assertion after getElementById. Initialization applies the saved or system theme before the first app frame. Custom initialization and provider options must match. This client-only setup needs no SSR ThemeScript or ssr.noExternal setting. Init and doctor support conventional index.html module entries.",
				],
				title: "React + Vite",
			},

			{
				code: {
					title: "vite.config.js",
					value: `import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Mizen imports its own CSS files, so the server bundle must include it.
  ssr: { noExternal: ["@mizen-labs/ui"] },
  plugins: [tanstackStart(), viteReact()],
});`,
				},
				id: "tanstack-start",
				paragraphs: [
					"TanStack Start builds with Vite. The package ships its atomic CSS, so no StyleX compiler plugin is needed in the consumer.",
					"Keep @mizen-labs/ui out of the server's externals. Its components import their own CSS files, which Node cannot load directly.",
				],
				title: "TanStack Start: Vite",
			},
			{
				code: {
					title: "src/routes/__root.jsx",
					value: `import mizenCss from "@mizen-labs/ui/styles.css?url";
import fontCss from "@fontsource-variable/wix-madefor-text/wght.css?url";
import { ThemeProvider, ThemeScript } from "@mizen-labs/ui/theme";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [
      { href: mizenCss, rel: "stylesheet" },
      { href: fontCss, rel: "stylesheet" },
      { href: appCss, rel: "stylesheet" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}`,
				},
				id: "tanstack-start-root",
				paragraphs: [
					"Render ThemeScript in the head, before HeadContent, so the theme applies before first paint. Load the package stylesheet and font through the route's head links, and wrap the content in ThemeProvider.",
					"A packed-archive test builds this setup and checks server rendering, hydration, the theme bootstrap, extracted styles, and keyboard interaction, alongside the Next consumer.",
				],
				title: "TanStack Start: root route",
			},
			{
				id: "support",
				paragraphs: [
					"Tested together: React 19.3, StyleX 0.19.1, Next 16.3, and TanStack Start 1.169 with Vite 8. A packed-archive test installs Mizen into a fresh app for each framework and checks server rendering, hydration, the theme bootstrap, extracted styles, and keyboard interaction.",
					"Mizen is pre-1.0: minor versions can change the API.",
				],
				title: "Tested versions",
			},
		],
		slug: "installation",
		title: "Installation",
	},
	cliGuide,
	{
		description:
			"How Mizen's closed styling works, and how to style what your app owns.",
		sections: [
			{
				id: "closed",
				links: [],
				paragraphs: [
					"No Mizen component or part accepts className or style. Prop types wrap the shared Closed<T>, so TypeScript rejects them, and the components strip them at runtime.",
					"Use the props each component documents instead: variant, size, tone, and similar. A missing variant is a request for the library, not something to patch locally.",
				],
				title: "Closed styling",
			},
			{
				id: "layout",
				links: [
					{ href: "/docs/components/stack", label: "Stack" },
					{ href: "/docs/components/inline", label: "Inline" },
					{ href: "/docs/components/grid", label: "Grid" },
				],
				paragraphs: [
					"Arrange components with Stack for vertical rhythm, Inline for rows, and Grid for columns. Group, Section, Frame, and Card group related content. Spacer adds space between items.",
					"These primitives use the spacing scale, so layouts keep one rhythm without custom margins.",
				],
				title: "Lay out with primitives",
			},
			{
				code: {
					value: `import { colors } from "@mizen-labs/ui/colors.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";

const styles = create({
  workarea: {
    backgroundColor: colors.workarea,
    color: colors.content,
    padding: space["4"],
  },
});

export function Workarea() {
  return <section {...props(styles.workarea)}>Project overview</section>;
}`,
				},
				id: "tokens",
				links: [
					{
						href: "/docs/composition",
						label: "Composition rules",
					},
				],
				paragraphs: [
					"Components have closed styling contracts. Use their supported props and composition. Do not pass className, style, sx, or xstyle to reopen their internals.",
					"When an app-owned host needs StyleX styling, configure the StyleX Babel and PostCSS plugins for that app first, then use the exported tokens. Keep static values in defineConsts, themed values in defineVars, and finite themes in createTheme. Avoid generated class selectors and descendant overrides.",
				],
				title: "Style app-owned elements",
			},
			{
				id: "token-subpaths",
				links: [
					{ href: "/docs/theming", label: "Theming" },
					{ href: "/docs/foundations", label: "Foundations" },
				],
				paragraphs: [
					"Tokens are StyleX variables, imported from subpaths: colors, spacing, shape, typography, motion, interaction, shadows, dimensions, fonts, palette, and conditions, each as @mizen-labs/ui/<name>.stylex. Type roles live in @mizen-labs/ui/typography.styles.",
					"Themes swap the variables, so styles written with tokens follow light and dark mode automatically.",
				],
				title: "Token subpaths",
			},
		],
		slug: "styling",
		title: "Styling",
	},
	{
		description:
			"Use typography and rhythm first, with neutral workareas and restrained wine selection.",
		sections: [
			{
				id: "typography",
				links: [
					{
						href: "/docs/components/heading",
						label: "Heading",
					},
					{
						href: "/docs/components/text",
						label: "Text",
					},
					{
						href: "/docs/components/stack",
						label: "Stack and spacing",
					},
				],
				paragraphs: [
					"Components inherit your interface font. Code uses the configurable mono font token. This site chooses Wix Madefor Text and JetBrains Mono. Default body and control text use 1rem at weight 400. Use Heading for titles and Text for paragraphs. Text sizes are body for prose, ui for dense interface text, and caption for metadata; the muted tone quiets supporting text without changing its size.",
					"The shared type scale runs from 0.6875rem to 2.25rem. Use hierarchy to separate tasks before introducing another panel. Group related controls with Stack and Inline. Keep labels close to controls, and separate unrelated sections with larger gaps.",
				],
				title: "Typography and rhythm",
			},
			{
				id: "surfaces",
				links: [
					{
						href: "/docs/components/card",
						label: "Card composition",
					},
					{
						href: "/docs/components/frame",
						label: "Frame",
					},
					{
						href: "/docs/components/input",
						label: "Input",
					},
				],
				paragraphs: [
					"Use surface for the white canvas in light mode. Use workarea for neutral grouped work zones. Use controlSurface for one recessed field fill on both canvas and workareas. Inputs and selects do not change color because they sit inside a card.",
					"Use floatingSurface for menus and overlays. Keep decorative depth on controls and floating content. Content separation comes from type, spacing, and quiet boundaries. A card should express a real grouping or task, rather than surround every piece of content.",
				],
				title: "Surface roles",
			},
			{
				id: "color",
				links: [
					{
						href: "/docs/components/button",
						label: "Button variants",
					},
					{
						href: "/docs/components/alert",
						label: "Status feedback",
					},
				],
				paragraphs: [
					"Neutral ink is the default action color. Use the Button brand variant for the main wine action. Checked controls use accent with accentContent. Quiet selected surfaces use brandBackground with brandForeground, the lavender and wine pair.",
					"Use content for headings and primary values. Use mutedContent for help text and secondary information. Use the semantic status pairs for success, warning, information, and destructive feedback. Color must not be the only state cue.",
				],
				title: "Action and selection color",
			},
			{
				id: "data",
				links: [
					{
						href: "/docs/components/chart-frame",
						label: "Chart Frame and palette examples",
					},
					{
						href: "/docs/components/chart-legend",
						label: "Chart Legend",
					},
				],
				paragraphs: [
					"The static palette has rose, orange, amber, green, teal, blue, violet, and pink ramps at 300, 500, and 700. Chart series 1 through 6 map to rose, orange, green, amber, pink, and teal. The semantic series tokens use 700 in light themes and 300 in dark themes.",
					"Use semantic series tokens so charts follow the active theme. Keep category meanings stable across views. Add labels, legends, units, and text summaries. Missing observations stay gaps.",
				],
				title: "Data color",
			},
			{
				id: "geometry",
				links: [
					{
						href: "/docs/components/checkbox",
						label: "Selection controls",
					},
					{
						href: "/docs/theming",
						label: "Theming and preferences",
					},
				],
				paragraphs: [
					"Standard controls keep the established 12px radius. Content surfaces use the shared 20px and 24px radii. Named control sizes preserve their existing geometry; do not resize controls with external CSS.",
					"Feedback should be fast and local. Shared press feedback uses scale 0.98 where supported. Preserve dimensions between states. Respect reduced motion and forced colors. Use labels, focus, borders, and indicators alongside color.",
				],
				title: "Geometry and feedback",
			},
		],
		slug: "foundations",
		title: "Foundations",
	},
	{
		description:
			"Bootstrap the root theme before content, then synchronize the user's preference.",
		sections: [
			{
				code: {
					title: "app/layout.tsx",
					value: `import "@mizen-labs/ui/styles.css";
import "./globals.css";
import { ThemeProvider, ThemeScript } from "@mizen-labs/ui/theme";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}`,
				},
				id: "bootstrap",
				paragraphs: [
					"Import the theme helpers from @mizen-labs/ui/theme. Emit ThemeScript synchronously in the server or static document head before body content. Wrap the app in ThemeProvider. Both default to system and the mizen-theme storage key.",
					"The app owns the fonts. This example uses system fonts. Load custom families only when needed and apply your interface font to body. The package stylesheet supplies the default light and dark themes. Custom createTheme overrides require your own StyleX compiler setup.",
				],
				title: "Theme and font layout",
			},
			{
				code: {
					value: `"use client";

import { Button } from "@mizen-labs/ui/button";
import { useTheme } from "@mizen-labs/ui/theme";

export function SystemThemeAction() {
  const { setTheme } = useTheme();
  return <Button onClick={() => setTheme("system")}>Use system theme</Button>;
}`,
				},
				id: "preference",
				paragraphs: [
					"useTheme returns theme, resolvedTheme, systemTheme, and setTheme. The preference is light, dark, or system. resolvedTheme is always light or dark. Read preference state inside a Client Component.",
					"If you override storageKey or defaultTheme, use the same values on ThemeScript and ThemeProvider. ThemeScript accepts a CSP nonce. ThemeProvider accepts a storage adapter with getItem and setItem; the head bootstrap still reads browser localStorage.",
				],
				title: "Choose a preference",
			},
			{
				id: "portals",
				links: [
					{
						href: "/docs/components/popover",
						label: "Popover portal contract",
					},
					{
						href: "/docs/components/dialog",
						label: "Dialog contract",
					},
				],
				paragraphs: [
					"ThemeProvider synchronizes data-theme, color-scheme, and the generated dark token classes on document.documentElement. Overlays portaled to document.body inherit that root theme.",
					"There is no general nested theme provider. A local theme scope does not reach a portal outside its subtree. Use the overlay's documented portal container within that scope when local theming is necessary. Never hardcode generated theme classes.",
				],
				title: "Root theme and portals",
			},
			{
				id: "preferences",
				links: [
					{
						href: "/docs/installation",
						label: "Installation and compiled CSS",
					},
				],
				paragraphs: [
					"Components honor reduced motion and forced colors through shared conditions. Forced colors use the user's system palette rather than preserving wine and lavender. Keep keyboard focus visible.",
					"Do not implement a second theme store or recolor component internals. Check theme changes with an open overlay, keyboard focus, and selected states. First-paint behavior needs a real browser check, not only a class assertion.",
				],
				title: "System preferences",
			},
		],
		slug: "theming",
		title: "Theming",
	},
	{
		description:
			"Build tasks from existing components with explicit state, labels, and client boundaries.",
		sections: [
			{
				id: "anatomy",
				links: [
					{
						href: "/docs",
						label: "Component catalog",
					},
				],
				paragraphs: [
					"Search the component catalog before adding a wrapper. Use the page's executable examples and exported prop types. Keep required labels, descriptions, indicators, triggers, and popup parts together.",
					"Components own appearance and interaction contracts. The application owns records, persistence, routing, authorization, and server failures. A completed UI callback does not mean that a server operation succeeded.",
				],
				title: "Start with the documented anatomy",
			},
			{
				id: "layout",
				links: [
					{
						href: "/docs/components/grid",
						label: "Grid",
					},
					{
						href: "/docs/components/inline",
						label: "Inline",
					},
				],
				paragraphs: [
					"Use Stack for vertical rhythm, Inline for a row, and Grid for columns. Card, Frame, and Section express different content groupings. Use their documented APIs instead of arbitrary wrappers that duplicate spacing.",
					"Keep primary actions close to the task they complete. Use neutral workareas for separate work zones and one field fill throughout.",
				],
				title: "Compose the task layout",
			},
			{
				code: {
					value: `import { Field, FieldDescription, FieldLabel, Input } from "@mizen-labs/ui";

export function ContactEmail() {
  return (
    <Field name="contactEmail">
      <FieldLabel>Contact email</FieldLabel>
      <Input autoComplete="email" type="email" />
      <FieldDescription>Used for project updates.</FieldDescription>
    </Field>
  );
}`,
				},
				id: "fields",
				links: [
					{
						href: "/docs/components/field",
						label: "Field examples and validation",
					},
					{
						href: "/docs/integrations#forms",
						label: "Form integration",
					},
				],
				paragraphs: [
					"Field groups the label, control, help, and error. Use a visible label. Placeholder text is an example or hint, not a replacement for the label.",
					"Use invalid and FieldError for validation feedback. Keep read-only and disabled meanings separate. Bind TanStack Form fields through Field's field prop when the form engine owns their value and validation.",
				],
				title: "Label and describe fields",
			},
			{
				id: "state",
				links: [
					{
						href: "/docs/components/select",
						label: "Select state and object values",
					},
					{
						href: "/docs/components/button",
						label: "Loading actions",
					},
					{
						href: "/docs/components/error-state",
						label: "Error recovery",
					},
				],
				paragraphs: [
					"Use defaultValue or defaultChecked when the component owns an initial value. Use value or checked with the documented change callback when the app owns it. Do not switch between controlled and uncontrolled ownership during a component's lifetime.",
					"Derive filtered records and counts from existing state. Put user actions in event handlers. Preserve loading, empty, error, and success states. Keep pending feedback associated with the action and prevent duplicate submission.",
				],
				title: "Keep one state owner",
			},
			{
				code: {
					value: `"use client";

import { Button } from "@mizen-labs/ui/button";
import { useState } from "react";

export function ReviewAction() {
  const [reviewed, setReviewed] = useState(false);
  return (
    <Button disabled={reviewed} onClick={() => setReviewed(true)}>
      {reviewed ? "Reviewed" : "Mark reviewed"}
    </Button>
  );
}`,
				},
				id: "client-boundaries",
				paragraphs: [
					"Next App Router pages and layouts are Server Components by default. Compose static content there. Put state, event handlers, browser APIs, and render callbacks in a file marked use client.",
					"Create callbacks on the client side of the boundary. Functions cannot cross as ordinary serialized props. Some Mizen exports carry their own client directive; use a client wrapper when an interactive third-party export lacks one. ThemeScript belongs in the server document head.",
				],
				title: "Server and Client boundaries",
			},
			{
				id: "verification",
				links: [
					{
						href: "/docs/foundations",
						label: "Design foundations",
					},
					{
						href: "/docs/integrations",
						label: "Supported integrations",
					},
				],
				paragraphs: [
					"Check keyboard order, focus return after overlays close, labels, and error associations. Exercise long content, narrow widths, both themes, and reduced motion. Keep numeric and date formatting deterministic during server rendering.",
					"Do not style internal data-slot hooks or generated classes. Use supported props. For a custom app-owned host, use StyleX and semantic tokens. Build consumer CSS at a real integration checkpoint.",
				],
				title: "Verify the whole task",
			},
		],
		slug: "composition",
		title: "Composition",
	},
	{
		description:
			"Use the existing form, table, and chart contracts. Keep application transport explicit.",
		sections: [
			{
				id: "forms",
				links: [
					{
						href: "/docs/components/form",
						label: "Executable form setup",
					},
					{
						href: "/docs/components/field",
						label: "Field binding",
					},
				],
				paragraphs: [
					"Mizen exports useForm and the Field bridge for TanStack Form. Bind a form.Field through Field's field prop. Keep validation in the form engine and show its result with FieldError.",
					"Use the documented form.Subscribe pattern for submit state. The app's onSubmit owns persistence and server error handling. Local examples demonstrate validation and state, not a live backend.",
				],
				title: "TanStack Form",
			},
			{
				id: "tables",
				links: [
					{
						href: "/docs/components/data-table",
						label: "DataTable API and examples",
					},
					{
						href: "/docs/components/table",
						label: "Table geometry",
					},
					{
						href: "/docs/components/toolbar",
						label: "Toolbar",
					},
				],
				paragraphs: [
					"Use Table for semantic rows and cells. Use DataTable for the TanStack Table model, sorting, filtering, selection, pagination, and supported virtualization. Keep column definitions and row identity explicit.",
					"The application owns data fetching and server-side operations. A client filter or sort is not a server query. Keep bulk actions tied to the correct selected records and clarify whether selection spans pages.",
				],
				title: "TanStack Table",
			},
			{
				id: "charts",
				links: [
					{
						href: "/docs/components/chart-frame",
						label: "ChartFrame examples",
					},
					{
						href: "/docs/components/time-series",
						label: "Time Series",
					},
					{
						href: "/docs/components/distribution",
						label: "Distribution",
					},
				],
				paragraphs: [
					"ChartFrame integrates TanStack Charts with Mizen tokens and accessible presentation. Use ChartLegend and ChartTooltip with the documented chart model. Higher-level data components cover time series, distribution, comparison, and other reviewed tasks.",
					"Keep underlying values precise while formatting compact axis ticks. Provide labels, units, and a readable summary. Do not add a second chart theme or a different chart engine to reproduce existing behavior.",
				],
				title: "TanStack Charts",
			},
			{
				id: "content",
				links: [
					{
						href: "/docs/components/markdown",
						label: "Markdown contract",
					},
				],
				paragraphs: [
					"Mizen ships no Markdown parser. Render documents with the parser your app already trusts, such as react-markdown with remark-gfm, inside Markdown with markdownComponents. Treat external content as data: skip raw HTML and keep URL sanitizing. Keep artifact and source links within the documented URL contracts.",
					"Mizen has no resizable panels. When an app needs a splitter, it brings its own, such as react-resizable-panels, and owns its keyboard behavior, minimum sizes, and persistence.",
				],
				title: "Markdown content",
			},
		],
		slug: "integrations",
		title: "Integrations",
	},
	{
		description:
			"What Mizen components guarantee, what your app owns, and what has been verified.",
		sections: [
			{
				id: "guarantees",
				paragraphs: [
					"Keyboard behavior follows WAI-ARIA patterns, through Base UI. Composite widgets keep one tab stop and move with the arrow keys.",
					"Focus rings show for keyboard use only, and stay visible in forced-colors mode. Motion respects reduced-motion settings. Layouts mirror in right-to-left languages.",
					"Components that need a name, including charts, Tree, Table, Carousel, and Code Block, throw an error in development when it is missing.",
				],
				title: "What components guarantee",
			},
			{
				id: "app-owned",
				links: [
					{ href: "/docs/components/field", label: "Field" },
					{ href: "/docs/composition", label: "Composition" },
				],
				paragraphs: [
					"Give every control a visible label or an accessible name. Use Field to connect labels, descriptions, and errors to inputs.",
					"Write meaningful page titles, headings, and alt text, and keep the page's heading order. Announce async results that happen away from the user's focus.",
				],
				title: "What your app owns",
			},
			{
				id: "verified",
				paragraphs: [
					"Automated browser tests cover keyboard paths, focus, forced colors, reduced motion, right-to-left layout, and enlarged text, in Chromium and WebKit.",
					"Firefox is not yet verified, and neither is manual testing with screen readers or on touch devices. These are open release tasks.",
				],
				title: "What is verified",
			},
		],
		slug: "accessibility",
		title: "Accessibility",
	},
	{
		description:
			"Give a coding agent Mizen's docs as Markdown, so it uses real components and APIs instead of guessing.",
		sections: [
			{
				id: "llms",
				links: [{ href: "/llms.txt", label: "llms.txt" }],
				paragraphs: [
					"/llms.txt lists every component and guide with a link to its Markdown. Point an agent there first.",
				],
				title: "Start with llms.txt",
			},
			{
				id: "markdown",
				links: [
					{
						href: "/docs/components/button/markdown",
						label: "Button as Markdown",
					},
				],
				paragraphs: [
					"Every component page has a Markdown version at /docs/components/<slug>/markdown. It includes the description, recommendations, usage boundaries, API, import line, anatomy, and examples. Guides have one at /docs/<guide>/markdown.",
					"Use Copy page on any component page to copy that Markdown, or open it in ChatGPT or Claude.",
				],
				title: "Markdown for every page",
			},
			{
				id: "skill",
				links: [
					{ href: "/skills/mizen-ui/SKILL.md", label: "Mizen consumer skill" },
				],
				paragraphs: [
					"The Mizen consumer skill tells an agent how to find components and compose them without inventing APIs. Add it to your agent's skills.",
				],
				title: "Consumer skill",
			},
			{
				id: "metadata",
				links: [
					{ href: "/docs/components/field/metadata", label: "Field metadata" },
				],
				paragraphs: [
					"/docs/components/<slug>/metadata returns a component's name, category, status, description, and API as JSON.",
				],
				title: "Metadata",
			},
			{
				id: "agent-apps",
				links: [
					{
						href: "/docs/components/composer",
						label: "Composer",
					},
				],
				paragraphs: [
					"Composer presents application-owned drafts and working state. It does not connect to a provider, send messages, or run tools.",
					"TanStack AI is the planned runtime integration. Live provider transport remains deferred until an actual app needs it. The docs examples do not implement streaming transport, cancellation, tool execution, or approval persistence. Keep those responsibilities explicit in the application.",
				],
				title: "Agent application boundaries",
			},
		],
		slug: "for-agents",
		title: "For agents",
	},
	...hookGuides,
];

export function getGuide(slug: string) {
	return guides.find((guide) => guide.slug === slug);
}

export function renderGuideMarkdown(guide: Guide) {
	return [
		`# ${guide.title}`,
		guide.description,
		...guide.sections.flatMap((section) => [
			`## ${section.title}`,
			...section.paragraphs,
			...(section.code
				? [`\`\`\`${section.code.title}\n${section.code.value}\n\`\`\``]
				: []),
			...(section.links ?? []).map((link) => `- [${link.label}](${link.href})`),
		]),
		"",
	].join("\n\n");
}
