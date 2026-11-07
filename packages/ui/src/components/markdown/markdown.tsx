import { props } from "@stylexjs/stylex";
import {
	type ComponentProps,
	type ComponentPropsWithRef,
	isValidElement,
	type JSX,
	type ReactNode,
} from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { Code } from "../code/code";
import { CodeBlockContent } from "../code-block/code-block";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "../table/table";
import { markdownStyles } from "./markdown.styles";

type NativeProps = ComponentPropsWithRef<"div">;
const tableAlignments = {
	center: "center",
	left: "start",
	right: "end",
} as const;

// Renderers pass their syntax-tree node as `node`; the map ignores it.
type ElementProps<Tag extends keyof JSX.IntrinsicElements> =
	ComponentProps<Tag> & { node?: unknown };
type MarkdownComponents = {
	[Tag in keyof JSX.IntrinsicElements]?: (
		props: ElementProps<Tag>
	) => ReactNode;
};

export type MarkdownProps = Omit<
	Closed<NativeProps>,
	"data-slot" | "dangerouslySetInnerHTML" | "role"
>;

function alignTableCell(align: string | undefined) {
	if (align === "center" || align === "left" || align === "right") {
		return tableAlignments[align];
	}
	return "start";
}

// Code blocks arrive as rendered children; keep only their text.
function textOf(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}
	if (Array.isArray(node)) {
		return node.map(textOf).join("");
	}
	if (isValidElement<{ children?: ReactNode }>(node)) {
		return textOf(node.props.children);
	}
	return "";
}

// Element map for any renderer that accepts a components prop, such as
// react-markdown or MDX. Parsing, plugins, and URL policy stay with the app.
export const markdownComponents = {
	a: ({ children, href, node: _node, title, ...rest }) => (
		<a
			{...rest}
			data-slot="markdown-link"
			href={href || undefined}
			title={title}
			{...props(markdownStyles.link)}
		>
			{children}
		</a>
	),
	blockquote: ({ children, node: _node, ...rest }) => (
		<blockquote
			{...rest}
			data-slot="markdown-blockquote"
			{...props(markdownStyles.blockquote)}
		>
			{children}
		</blockquote>
	),
	code: ({ children, className: _className, node: _node, ...rest }) => (
		<Code {...rest}>{children}</Code>
	),
	h1: ({ children, node: _node, ...rest }) => (
		<h1
			{...rest}
			data-slot="markdown-heading"
			{...props(markdownStyles.heading, typeRoles.title)}
		>
			{children}
		</h1>
	),
	h2: ({ children, node: _node, ...rest }) => (
		<h2
			{...rest}
			data-slot="markdown-heading"
			{...props(markdownStyles.heading, typeRoles.heading)}
		>
			{children}
		</h2>
	),
	h3: ({ children, node: _node, ...rest }) => (
		<h3
			{...rest}
			data-slot="markdown-heading"
			{...props(markdownStyles.heading, markdownStyles.headingThree)}
		>
			{children}
		</h3>
	),
	h4: ({ children, node: _node, ...rest }) => (
		<h4
			{...rest}
			data-slot="markdown-heading"
			{...props(markdownStyles.heading, markdownStyles.headingFour)}
		>
			{children}
		</h4>
	),
	h5: ({ children, node: _node, ...rest }) => (
		<h5
			{...rest}
			data-slot="markdown-heading"
			{...props(markdownStyles.heading, markdownStyles.headingFive)}
		>
			{children}
		</h5>
	),
	h6: ({ children, node: _node, ...rest }) => (
		<h6
			{...rest}
			data-slot="markdown-heading"
			{...props(markdownStyles.heading, markdownStyles.headingSix)}
		>
			{children}
		</h6>
	),
	hr: ({ node: _node, ...rest }) => (
		<hr {...rest} data-slot="markdown-rule" {...props(markdownStyles.rule)} />
	),
	img: ({ alt, height, node: _node, src, title, width, ...rest }) => (
		// biome-ignore lint/performance/noImgElement: Markdown images accept arbitrary sources and must stay framework-neutral.
		<img
			{...rest}
			alt={alt ?? ""}
			data-slot="markdown-image"
			height={height}
			src={src || undefined}
			title={title}
			width={width}
			{...props(markdownStyles.image)}
		/>
	),
	input: ({ checked, node: _node, type, ...rest }) => (
		<input
			{...rest}
			aria-label={checked ? "Task completed" : "Task not completed"}
			checked={checked}
			data-slot="markdown-task"
			disabled
			type={type}
			{...props(markdownStyles.checkbox)}
		/>
	),
	li: ({ children, className: _className, node: _node, ...rest }) => (
		<li
			{...rest}
			data-slot="markdown-list-item"
			{...props(markdownStyles.listItem)}
		>
			{children}
		</li>
	),
	ol: ({ children, node: _node, ...rest }) => (
		<ol
			{...rest}
			data-slot="markdown-ordered-list"
			{...props(markdownStyles.list, typeRoles.body)}
		>
			{children}
		</ol>
	),
	p: ({ children, node: _node, ...rest }) => (
		<p
			{...rest}
			data-slot="markdown-paragraph"
			{...props(markdownStyles.paragraph, typeRoles.body)}
		>
			{children}
		</p>
	),
	pre: ({ children }) => (
		<CodeBlockContent aria-label="Code block">
			{textOf(children)}
		</CodeBlockContent>
	),
	table: ({ children, node: _node }) => (
		<TableContainer aria-label="Markdown table" scroll="horizontal">
			<Table>{children}</Table>
		</TableContainer>
	),
	tbody: ({ children, node: _node, ...rest }) => (
		<TableBody {...rest}>{children}</TableBody>
	),
	td: ({ align, children, node: _node, ...rest }) => (
		<TableCell {...rest} align={alignTableCell(align)}>
			{children}
		</TableCell>
	),
	th: ({ align, children, node: _node, ...rest }) => (
		<TableHead {...rest} align={alignTableCell(align)} scope="col">
			{children}
		</TableHead>
	),
	thead: ({ children, node: _node, ...rest }) => (
		<TableHeader sticky={false} {...rest}>
			{children}
		</TableHeader>
	),
	tr: ({ children, node: _node, ...rest }) => (
		<TableRow {...rest}>{children}</TableRow>
	),
	ul: ({ children, className: _className, node: _node, ...rest }) => (
		<ul
			{...rest}
			data-slot="markdown-unordered-list"
			{...props(markdownStyles.list, typeRoles.body)}
		>
			{children}
		</ul>
	),
} satisfies MarkdownComponents;

function stripReservedProps(attributes: Record<string, unknown>) {
	Reflect.deleteProperty(attributes, "className");
	Reflect.deleteProperty(attributes, "data-slot");
	Reflect.deleteProperty(attributes, "dangerouslySetInnerHTML");
	Reflect.deleteProperty(attributes, "role");
	Reflect.deleteProperty(attributes, "style");
}

// Reading layout for rendered Markdown. Render the document inside it with
// `markdownComponents`.
export function Markdown({
	children,
	ref: forwardedRef,
	...rest
}: MarkdownProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="markdown"
			ref={forwardedRef}
			{...props(markdownStyles.root, typeRoles.body)}
		>
			{children}
		</div>
	);
}
