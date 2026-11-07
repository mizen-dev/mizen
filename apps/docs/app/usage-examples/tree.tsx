import { Tree, type TreeItemData } from "@mizen-labs/ui";
import {
	IconBraces,
	IconFileTypeCss,
	IconFileTypeTsx,
	IconFolder,
	IconFolderOpen,
	IconMarkdown,
} from "@tabler/icons-react";

const folder = <IconFolder size="1em" />;
const openFolder = <IconFolderOpen size="1em" />;
const tsx = <IconFileTypeTsx size="1em" />;

const items: readonly TreeItemData[] = [
	{
		children: [
			{
				children: [
					{ icon: tsx, id: "page", label: "page.tsx" },
					{ icon: tsx, id: "layout", label: "layout.tsx" },
				],
				expandedIcon: openFolder,
				icon: folder,
				id: "app",
				label: "app",
			},
			{
				children: [
					{ icon: tsx, id: "button", label: "button.tsx" },
					{ icon: tsx, id: "dialog", label: "dialog.tsx" },
				],
				expandedIcon: openFolder,
				icon: folder,
				id: "components",
				label: "components",
			},
			{
				icon: <IconFileTypeCss size="1em" />,
				id: "globals",
				label: "globals.css",
			},
		],
		expandedIcon: openFolder,
		icon: folder,
		id: "src",
		label: "src",
	},
	{ icon: <IconBraces size="1em" />, id: "package", label: "package.json" },
	{ icon: <IconMarkdown size="1em" />, id: "readme", label: "README.md" },
];

export function WorkspaceTree() {
	return (
		<Tree
			aria-label="Project files"
			defaultExpandedItems={["src", "app"]}
			defaultSelectedItemId="page"
			items={items}
		/>
	);
}
