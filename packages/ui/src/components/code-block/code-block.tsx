import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { codeBlockStyles } from "./code-block.styles";
import {
	type CodeBlockLanguage,
	HighlightedCode,
} from "./code-block-highlight";

type Part<T> = Omit<Closed<T>, "children" | "data-slot" | "role"> & {
	children: ReactNode;
};

export type CodeBlockProps = Part<ComponentPropsWithRef<"figure">>;
export type CodeBlockHeaderProps = Part<ComponentPropsWithRef<"figcaption">>;
export type CodeBlockTitleProps = Part<ComponentPropsWithRef<"span">>;
export type CodeBlockContentProps = Omit<
	Closed<ComponentPropsWithRef<"pre">>,
	"aria-label" | "children" | "data-slot" | "role" | "tabIndex"
> & {
	"aria-label": string;
	children: ReactNode;
	/** Colors string children as this language. Without it, code stays plain. */
	language?: CodeBlockLanguage;
};

function stripReservedProps(attributes: object) {
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(attributes, name);
	}
}

export function CodeBlock({
	children,
	ref: forwardedRef,
	...rest
}: CodeBlockProps) {
	stripReservedProps(rest);
	return (
		<figure
			{...rest}
			data-slot="code-block"
			ref={forwardedRef}
			{...props(codeBlockStyles.root, typeRoles.body)}
		>
			{children}
		</figure>
	);
}

export function CodeBlockHeader({
	children,
	ref: forwardedRef,
	...rest
}: CodeBlockHeaderProps) {
	stripReservedProps(rest);
	return (
		<figcaption
			{...rest}
			data-slot="code-block-header"
			ref={forwardedRef}
			{...props(codeBlockStyles.header, typeRoles.body)}
		>
			{children}
		</figcaption>
	);
}

export function CodeBlockTitle({
	children,
	ref: forwardedRef,
	...rest
}: CodeBlockTitleProps) {
	stripReservedProps(rest);
	return (
		<span
			{...rest}
			data-slot="code-block-title"
			ref={forwardedRef}
			{...props(typeRoles.ui, codeBlockStyles.title)}
		>
			{children}
		</span>
	);
}

export function CodeBlockContent({
	"aria-label": ariaLabel,
	children,
	language,
	ref: forwardedRef,
	...rest
}: CodeBlockContentProps) {
	if (!ariaLabel.trim()) {
		throw new TypeError(
			"CodeBlockContent requires a non-empty accessible name."
		);
	}
	stripReservedProps(rest);
	Reflect.deleteProperty(rest, "tabIndex");
	return (
		// biome-ignore lint/a11y/useSemanticElements: pre preserves code semantics while naming the scroll region.
		<pre
			{...rest}
			aria-label={ariaLabel}
			data-slot="code-block-content"
			ref={forwardedRef}
			role="region"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard focus lets users scroll long code.
			tabIndex={0}
			{...props(typeRoles.mono, codeBlockStyles.content)}
		>
			<code data-language={language} {...props(codeBlockStyles.code)}>
				{language && typeof children === "string" ? (
					<HighlightedCode code={children} language={language} />
				) : (
					children
				)}
			</code>
		</pre>
	);
}

export type { CodeBlockCopyProps } from "./code-block-copy";
// biome-ignore lint/performance/noBarrelFile: Keep the complete code block API beside its native figure anatomy.
export { CodeBlockCopy } from "./code-block-copy";
export type { CodeBlockLanguage } from "./code-block-highlight";
