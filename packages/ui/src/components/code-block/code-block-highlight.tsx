// biome-ignore-all lint/performance/noNamespaceImport: each sugar-high language module is one whole set of parse options, so nothing is left to shake.
// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable source positions identify syntax tokens.
import { props, type StyleXStyles } from "@stylexjs/stylex";
import { Fragment } from "react";
import { type ParseOptions, parse, type TokenType } from "sugar-high/core";
import * as css from "sugar-high/lang/css";
import * as diff from "sugar-high/lang/diff";
import * as html from "sugar-high/lang/html";
import * as javascript from "sugar-high/lang/javascript";
import * as json from "sugar-high/lang/json";
import * as markdown from "sugar-high/lang/markdown";
import * as python from "sugar-high/lang/python";
import * as shell from "sugar-high/lang/shell";
import * as sql from "sugar-high/lang/sql";
import * as typescript from "sugar-high/lang/typescript";
import * as yaml from "sugar-high/lang/yaml";
import { codeBlockStyles } from "./code-block.styles";

// Each sugar-high language module is a set of parse options. TypeScript also
// covers TSX, and JavaScript covers JSX.
const languages = {
	css,
	diff,
	html,
	javascript,
	json,
	markdown,
	python,
	shell,
	sql,
	typescript,
	yaml,
};

export type CodeBlockLanguage = keyof typeof languages;

const tokenStyles: Partial<Record<TokenType, StyleXStyles>> = {
	class: codeBlockStyles.syntaxEntity,
	comment: codeBlockStyles.syntaxComment,
	entity: codeBlockStyles.syntaxEntity,
	keyword: codeBlockStyles.syntaxKeyword,
	property: codeBlockStyles.syntaxProperty,
	string: codeBlockStyles.syntaxString,
};

/** Tokenizes code synchronously, so server-rendered code arrives colored. */
export function HighlightedCode({
	code,
	language,
}: {
	code: string;
	language: CodeBlockLanguage;
}) {
	// The modules are parse options at runtime; the JS tokenizer's published
	// type is narrower than ParseOptions["tokenize"], so it needs the cast.
	const { lines } = parse(code, languages[language] as ParseOptions);
	// A trailing newline would add an empty last line.
	const lineCount = lines.length - Number(code.endsWith("\n"));
	return lines.slice(0, lineCount).map((line) => (
		<Fragment key={line.index}>
			{line.tokens.map((token, index) => (
				<span key={index} {...props(tokenStyles[token.type])}>
					{token.value}
				</span>
			))}
			{line.index < lineCount - 1 ? "\n" : null}
		</Fragment>
	));
}
