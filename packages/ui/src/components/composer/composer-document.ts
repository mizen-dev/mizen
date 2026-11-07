import { getComposerQuery } from "./composer-query";
import type {
	ComposerItemValue,
	ComposerPart,
	ComposerQuery,
	ComposerTokenPart,
	ComposerTrigger,
	ComposerValue,
} from "./composer-value";

export interface ComposerSelection {
	anchor: number;
	focus: number;
}
export interface ComposerSnapshot {
	selection: ComposerSelection | null;
	value: ComposerValue;
}
export type ActiveQuery = ComposerQuery & {
	range: Range;
	node: Text;
	start: number;
	end: number;
};
type Point = [Node, number];
interface Segment {
	from: Point;
	part: ComposerPart;
	to: Point;
}
const ids = new WeakMap<Node, string>();
let sequence = 0;
const TOKEN_FIELDS = [
	"id",
	"label",
	"trigger",
	"kind",
	"data",
	"text",
] as const;
const WHITESPACE = /\s/u;

export function getComposerText(value: ComposerValue): string {
	return value.map(partText).join("");
}
function partText(part: ComposerPart): string {
	if (part.type === "text") {
		return part.text;
	}
	return part.text ?? part.trigger + part.label;
}
function compact(parts: ComposerValue): ComposerPart[] {
	const result: ComposerPart[] = [];
	for (const part of parts) {
		const last = result.at(-1);
		if (part.type !== "text") {
			result.push({ ...part });
		} else if (last?.type === "text") {
			last.text += part.text;
		} else if (part.text) {
			result.push({ ...part });
		}
	}
	return result;
}
export function equalValue(a: ComposerValue, b: ComposerValue): boolean {
	const left = compact(a);
	const right = compact(b);
	return (
		left.length === right.length &&
		left.every((part, i) => samePart(part, right[i]))
	);
}
function samePart(a: ComposerPart, b: ComposerPart | undefined): boolean {
	if (!b || a.type !== b.type) {
		return false;
	}
	if (a.type === "text") {
		return b.type === "text" && a.text === b.text;
	}
	return (
		b.type !== "text" && TOKEN_FIELDS.every((field) => a[field] === b[field])
	);
}
export function readToken(element: HTMLElement): ComposerTokenPart {
	const token: ComposerTokenPart = {
		id: element.dataset.id ?? "",
		label: element.dataset.label ?? "",
		trigger: element.dataset.trigger ?? "@",
		type: element.dataset.composerToken === "action" ? "action" : "mention",
	};
	for (const field of ["kind", "data", "text"] as const) {
		const value = element.dataset[field];
		if (value !== undefined) {
			token[field] = value;
		}
	}
	return token;
}
function tokenElement(node: Node): node is HTMLElement {
	return (
		node instanceof HTMLElement &&
		["mention", "action"].includes(node.dataset.composerToken ?? "")
	);
}
function block(node: Node | undefined): boolean {
	return node instanceof HTMLElement && ["DIV", "P"].includes(node.tagName);
}
function newline(from: Point, to: Point): Segment {
	return { from, part: { text: "\n", type: "text" }, to };
}
/** One projection supplies canonical text and both directions of caret mapping. */
function segments(parent: Node, trimBreak = true): Segment[] {
	return Array.from(parent.childNodes).flatMap((node, index, siblings) => {
		const from: Point = [parent, index];
		const to: Point = [parent, index + 1];
		if (node instanceof Text) {
			return [
				{
					from: [node, 0] as Point,
					part: { text: node.data, type: "text" as const },
					to: [node, node.length] as Point,
				},
			];
		}
		if (tokenElement(node)) {
			return [{ from, part: readToken(node), to }];
		}
		if (!(node instanceof HTMLElement)) {
			return [];
		}
		if (node.tagName === "BR") {
			return breakSegments(
				node,
				from,
				to,
				trimBreak && index === siblings.length - 1
			);
		}
		const content = segments(node, trimBreak);
		return surroundBlock(content, node, index, siblings, from, to);
	});
}
function breakSegments(
	node: HTMLElement,
	from: Point,
	to: Point,
	trailing: boolean
): Segment[] {
	return trailing || node.hasAttribute("data-composer-placeholder")
		? []
		: [newline(from, to)];
}
function surroundBlock(
	content: Segment[],
	node: Node,
	index: number,
	siblings: Node[],
	from: Point,
	to: Point
): Segment[] {
	if (!block(node)) {
		return content;
	}
	const before = index > 0 && !(siblings[index - 1] instanceof HTMLBRElement);
	const after = index < siblings.length - 1 && !block(siblings[index + 1]);
	return [
		...(before ? [newline(from, [node, 0])] : []),
		...content,
		...(after ? [newline([node, node.childNodes.length], to)] : []),
	];
}
export function readValue(
	root: HTMLElement,
	ignoreTrailingPlaceholder = true
): ComposerValue {
	if (root instanceof HTMLTextAreaElement) {
		return compact([{ text: root.value, type: "text" }]);
	}
	return compact(
		segments(root, ignoreTrailingPlaceholder).map(({ part }) => part)
	);
}
function createToken(
	part: ComposerTokenPart,
	doc: Document = document
): HTMLSpanElement {
	const element = doc.createElement("span");
	element.contentEditable = "false";
	element.dataset.composerToken = part.type;
	for (const key of TOKEN_FIELDS) {
		if (part[key] !== undefined) {
			element.dataset[key] = part[key];
		}
	}
	for (const slot of ["fallback", "renderer"]) {
		const child = doc.createElement("span");
		child.dataset.slot = `composer-token-${slot}`;
		if (slot === "fallback") {
			child.textContent = partText(part);
		}
		element.append(child);
	}
	return element;
}
function fragmentFor(
	root: HTMLElement,
	value: ComposerValue
): DocumentFragment {
	const doc = root.ownerDocument;
	const fragment = doc.createDocumentFragment();
	for (const part of value) {
		fragment.append(
			part.type === "text"
				? doc.createTextNode(part.text)
				: createToken(part, doc)
		);
	}
	return fragment;
}
export function writeValue(root: HTMLElement, value: ComposerValue): void {
	if (root instanceof HTMLTextAreaElement) {
		root.value = getComposerText(value);
		return;
	}
	const fragment = fragmentFor(root, value);
	if (getComposerText(value).endsWith("\n")) {
		const placeholder = root.ownerDocument.createElement("br");
		placeholder.dataset.composerPlaceholder = "";
		fragment.append(placeholder);
	}
	root.replaceChildren(fragment);
}
export function editorRange(root: HTMLElement): Range | null {
	const selection = root.ownerDocument.getSelection();
	if (!selection?.rangeCount) {
		return null;
	}
	const range = selection.getRangeAt(0);
	return root.contains(range.commonAncestorContainer) ? range : null;
}
export function replaceRange(
	root: HTMLElement,
	range: Range,
	value: ComposerValue
): void {
	const fragment = fragmentFor(root, value);
	const end = fragment.lastChild;
	range.deleteContents();
	range.insertNode(fragment);
	if (end) {
		range.setStartAfter(end);
	}
	range.collapse(true);
	const selection = root.ownerDocument.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);
}
export function insertPlainText(root: HTMLElement, text: string): void {
	const range = editorRange(root);
	if (range) {
		replaceRange(root, range, [
			{ text: text.replace(/\r\n?/gu, "\n"), type: "text" },
		]);
	}
}
function comparePoints(a: Point, b: Point): number {
	const doc = a[0].ownerDocument ?? document;
	const left = doc.createRange();
	const right = doc.createRange();
	left.setStart(...a);
	left.collapse(true);
	right.setStart(...b);
	right.collapse(true);
	return left.compareBoundaryPoints(Range.START_TO_START, right);
}
function offsetAt(projection: Segment[], point: Point): number {
	let offset = 0;
	for (const segment of projection) {
		if (comparePoints(point, segment.from) <= 0) {
			return offset;
		}
		if (segment.from[0] === point[0] && point[0] instanceof Text) {
			return offset + point[1];
		}
		offset += partText(segment.part).length;
		if (comparePoints(point, segment.to) <= 0) {
			return offset;
		}
	}
	return offset;
}
export function readSelection(root: HTMLElement): ComposerSelection | null {
	if (root instanceof HTMLTextAreaElement) {
		if (root.ownerDocument.activeElement !== root) {
			return null;
		}
		const positions = [root.selectionStart, root.selectionEnd];
		if (root.selectionDirection === "backward") {
			positions.reverse();
		}
		return { anchor: positions[0], focus: positions[1] };
	}
	const selection = root.ownerDocument.getSelection();
	if (!(selection?.anchorNode && selection.focusNode && editorRange(root))) {
		return null;
	}
	const projection = segments(root);
	return {
		anchor: offsetAt(projection, [
			selection.anchorNode,
			selection.anchorOffset,
		]),
		focus: offsetAt(projection, [selection.focusNode, selection.focusOffset]),
	};
}
function pointAt(root: HTMLElement, offset: number): Point {
	let remaining = Math.max(0, offset);
	for (const segment of segments(root)) {
		const { length } = partText(segment.part);
		if (remaining <= length) {
			if (segment.from[0] instanceof Text) {
				return [segment.from[0], remaining];
			}
			return remaining === 0 ? segment.from : segment.to;
		}
		remaining -= length;
	}
	return [root, root.childNodes.length];
}
export function restoreSelection(
	root: HTMLElement,
	selection: ComposerSelection | null
): void {
	if (!selection) {
		return;
	}
	const { anchor, focus } = selection;
	if (root instanceof HTMLTextAreaElement) {
		root.setSelectionRange(
			Math.min(anchor, focus),
			Math.max(anchor, focus),
			anchor > focus ? "backward" : "forward"
		);
	} else {
		root.ownerDocument
			.getSelection()
			?.setBaseAndExtent(...pointAt(root, anchor), ...pointAt(root, focus));
	}
}
interface QueryRun {
	caret: number;
	nodes: Text[];
	text: string;
}
function queryRun(node: Text, offset: number): QueryRun {
	let first = node;
	while (first.previousSibling instanceof Text) {
		first = first.previousSibling;
	}
	const nodes: Text[] = [];
	let current: Node | null = first;
	let text = "";
	let caret = offset;
	while (current instanceof Text) {
		if (current === node) {
			caret = text.length + offset;
		}
		nodes.push(current);
		text += current.data;
		current = current.nextSibling;
	}
	return { caret, nodes, text };
}
function runPoint(nodes: Text[], offset: number): Point {
	let remaining = offset;
	for (const node of nodes) {
		if (remaining <= node.length) {
			return [node, remaining];
		}
		remaining -= node.length;
	}
	const last = nodes.at(-1) ?? nodes[0];
	return [last, last.length];
}
/** Read adjacent text as one query without mutating browser or React-owned nodes. */
export function currentQuery(
	root: HTMLElement,
	triggers: readonly ComposerTrigger[]
): ActiveQuery | null {
	const selection = root.ownerDocument.getSelection();
	if (!(selection?.isCollapsed && editorRange(root))) {
		return null;
	}
	const anchor = selection.anchorNode;
	if (
		!(anchor instanceof Text) ||
		anchor.parentElement?.closest("[data-composer-token]")
	) {
		return null;
	}
	const run = queryRun(anchor, selection.anchorOffset);
	const [node] = run.nodes;
	const query = getComposerQuery(
		run.text,
		run.caret,
		triggers.map(({ character }) => character)
	);
	if (!(query && queryAllowed(node, query, triggers))) {
		return null;
	}
	if (!ids.has(node)) {
		sequence += 1;
		ids.set(node, String(sequence));
	}
	const range = root.ownerDocument.createRange();
	range.setStart(...runPoint(run.nodes, query.start));
	range.setEnd(...runPoint(run.nodes, query.end));
	return {
		...query,
		key: `${ids.get(node)}:${query.character}:${query.start}:${run.caret}:${query.text}`,
		node,
		range,
	};
}
function queryAllowed(
	node: Text,
	query: { start: number; text: string; character: string },
	triggers: readonly ComposerTrigger[]
): boolean {
	const limit =
		triggers.find(({ character }) => character === query.character)
			?.maxQueryLength ?? Number.POSITIVE_INFINITY;
	const previous = node.previousSibling?.textContent ?? "";
	return (
		query.text.length <= limit &&
		(query.start !== 0 || !previous || WHITESPACE.test(previous.slice(-1)))
	);
}
export function getFilteredItems(
	trigger: ComposerTrigger | undefined,
	query: ComposerQuery | null,
	contains: (text: string, query: string) => boolean
): readonly ComposerItemValue[] {
	if (!(trigger && query && fresh(trigger, query))) {
		return [];
	}
	if (trigger.filter === null) {
		return trigger.items;
	}
	const filter =
		trigger.filter ??
		((item: ComposerItemValue, text: string) => contains(item.label, text));
	return trigger.items.filter((item) => filter(item, query.text));
}
function fresh(trigger: ComposerTrigger, query: ComposerQuery): boolean {
	return (
		(trigger.status ?? "ready") === "ready" &&
		(trigger.itemsFor === undefined || trigger.itemsFor === query.text) &&
		(trigger.queryKey === undefined || trigger.queryKey === query.key)
	);
}
export function hasVisibleItems(
	trigger: ComposerTrigger | undefined,
	items: readonly ComposerItemValue[]
): boolean {
	return (
		!!trigger &&
		(items.length > 0 ||
			!!trigger.showEmpty ||
			["loading", "error"].includes(trigger.status ?? "ready"))
	);
}
export function queryRange(query: ActiveQuery): Range {
	return query.range.cloneRange();
}
export function insertItem(
	root: HTMLElement,
	query: ActiveQuery,
	item: ComposerItemValue
): void {
	const end = query.range.endContainer;
	const following =
		end instanceof Text ? end.data.slice(query.range.endOffset) : "";
	const separator = WHITESPACE.test(following.charAt(0));
	const range = queryRange(query);
	root.focus({ preventScroll: true });
	replaceRange(root, range, [
		{ ...item, trigger: query.character, type: item.type ?? "mention" },
		...(separator ? [] : [{ text: " ", type: "text" as const }]),
	]);
	if (separator) {
		const caret = readSelection(root);
		if (caret) {
			restoreSelection(root, {
				anchor: caret.anchor + 1,
				focus: caret.focus + 1,
			});
		}
	}
}
export type {
	ComposerItemValue,
	ComposerQuery,
	ComposerTokenPart,
	ComposerTrigger,
	ComposerValue,
} from "./composer-value";
