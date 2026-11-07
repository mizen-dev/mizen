import { props } from "@stylexjs/stylex";
import {
	IconFileCode,
	IconFileSpreadsheet,
	IconFileText,
	IconPresentation,
	IconVideo,
} from "@tabler/icons-react";
import { fileTypeIconStyles } from "./file-type-icon.styles";

const FILE_EXTENSION = /\.([^.]+)$/;

const fileKinds = [
	{
		extension: /^(csv|tsv|xls|xlsx|xlsm|ods|numbers)$/,
		kind: "spreadsheet",
		mime: /spreadsheet|excel|text\/(csv|tab-separated-values)/,
	},
	{
		extension: /^(ppt|pptx|pps|ppsx|odp|key)$/,
		kind: "presentation",
		mime: /presentation|powerpoint|keynote/,
	},
	{
		extension:
			/^(js|jsx|ts|tsx|mjs|cjs|json|html|css|scss|xml|py|rb|rs|go|java|c|cpp|h|cs|sh|sql|yaml|yml|toml)$/,
		kind: "code",
		mime: /^(application|text)\/(x-)?(javascript|typescript|json|xml|html|css|python|shellscript)(;|$)/,
	},
	{
		extension: /^(mp4|webm|mov|m4v|avi|mkv|mpeg|mpg|ogv)$/,
		kind: "video",
		mime: /^video\//,
	},
] as const;

// Replace these five entries when Mizen's icon set arrives. File Upload owns no icon dependency.
const icons = {
	code: IconFileCode,
	document: IconFileText,
	presentation: IconPresentation,
	spreadsheet: IconFileSpreadsheet,
	video: IconVideo,
};

export function getFileKind(file: Pick<File, "name" | "type">) {
	const extension = file.name.match(FILE_EXTENSION)?.[1].toLowerCase() ?? "";
	const mime = file.type.toLowerCase();
	return (
		(
			fileKinds.find((rule) => rule.mime.test(mime)) ??
			fileKinds.find((rule) => rule.extension.test(extension))
		)?.kind ?? "document"
	);
}

export function FileTypeIcon({ file }: { file: Pick<File, "name" | "type"> }) {
	const kind = getFileKind(file);
	const Icon = icons[kind];
	return (
		<Icon
			aria-hidden="true"
			data-file-kind={kind}
			size={24}
			stroke={1.5}
			{...props(fileTypeIconStyles[kind])}
		/>
	);
}
