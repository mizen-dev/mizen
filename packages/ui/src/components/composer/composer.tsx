"use client";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import { props as stylexProps } from "@stylexjs/stylex";
import {
	type ComponentProps,
	createContext,
	type MouseEvent,
	type PointerEvent,
	type ReactElement,
	type ReactNode,
	type Ref,
	useContext,
} from "react";
import { createPortal } from "react-dom";
import type { Closed } from "../../closed";
import { IconArrowUp, IconPlayerStopFilled } from "../../icons";
import { Button } from "../button/button";
import { presentation } from "./composer.styles";
import {
	type ComposerEditorOptions,
	ComposerEditorProvider,
	type ComposerItemValue,
	type ComposerTokenPart,
	focusComposerInput,
	getComposerText,
	readComposerToken,
	useComposerEditorContext,
	useComposerInputLayout,
	useComposerItem,
	useComposerSuggestionsContext,
} from "./composer-editor";
import { composerPartStyles } from "./composer-parts.styles";
import { ComposerScrollArea } from "./composer-scroll-area";
import "./composer.css";

const StopAction = createContext<(() => void) | undefined>(undefined);
type ComposerPopupProps = Closed<
	ComponentProps<typeof PopoverPrimitive.Popup> & {
		anchor?: ComponentProps<typeof PopoverPrimitive.Positioner>["anchor"];
		side?: ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
		align?: ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
		sideOffset?: ComponentProps<
			typeof PopoverPrimitive.Positioner
		>["sideOffset"];
		alignOffset?: ComponentProps<
			typeof PopoverPrimitive.Positioner
		>["alignOffset"];
		portalProps?: Closed<ComponentProps<typeof PopoverPrimitive.Portal>>;
	}
>;

type ComposerFormProps = Closed<useRender.ComponentProps<"form">>;
type ComposerLayout = "stacked" | "adaptive";
type ComposerTokenVariant = "default" | "chip";

export type ComposerProps = Closed<
	Omit<ComposerFormProps, "defaultValue" | "onSubmit" | "name"> &
		ComposerEditorOptions & {
			layout?: ComposerLayout;
			/**
			 * Stops the agent. While `working`, the submit button becomes Stop and
			 * Enter no longer sends.
			 */
			onStop?: () => void;
			/** The agent is working on the last message; the composer glows. */
			working?: boolean;
		}
>;

// All renderable div parts share the same ownership and event-merging rules.
function useDivPart(
	name: string,
	external: useRender.ComponentProps<"div">,
	defaults: ComponentProps<"div">,
	refs: Ref<HTMLDivElement>[] = []
): ReactElement {
	const { render, ref, ...rest } = external;
	Reflect.deleteProperty(rest, "data-slot");
	return useRender({
		defaultTagName: "div",
		props: mergeProps<"div">({ ...defaults, ...{ "data-slot": name } }, rest),
		ref: [...refs, ref ?? null],
		render,
	});
}

function WorkingLight(): ReactElement {
	const band = <span {...stylexProps(composerPartStyles.glowBand)} />;
	return (
		<span
			aria-hidden="true"
			data-slot="composer-glow"
			{...stylexProps(composerPartStyles.glow)}
		>
			<span {...stylexProps(composerPartStyles.glowRing)}>{band}</span>
			<span {...stylexProps(composerPartStyles.glowBloom)}>
				<span {...stylexProps(composerPartStyles.glowRing)}>{band}</span>
			</span>
		</span>
	);
}
function ComposerFrame({
	layout = "stacked",
	name,
	render,
	ref,
	children,
	...external
}: ComposerFormProps & { layout?: ComposerLayout }): ReactElement {
	const editor = useComposerEditorContext();
	if (!editor) {
		throw new Error("ComposerFrame requires Composer.");
	}
	Reflect.deleteProperty(external, "data-slot");
	const contents = (
		<>
			<WorkingLight />
			{children}
			{name ? (
				<input
					disabled={editor.disabled}
					name={name}
					type="hidden"
					value={getComposerText(editor.value)}
				/>
			) : null}
		</>
	);
	return useRender({
		defaultTagName: "form",
		props: mergeProps<"form">(
			{
				...presentation("frame"),
				children: contents,
				...{ "data-base-ui-swipe-ignore": "" },
				...{ "data-disabled": editor.disabled ? "" : undefined },
				...{ "data-layout": layout },
				...{ "data-readonly": editor.readOnly ? "" : undefined },
				...{ "data-slot": "composer" },
				onClick: (event) => focusComposerInput(event, false),
				onMouseDown: (event) => focusComposerInput(event, true),
			},
			editor.formProps,
			external
		),
		ref: [editor.rootRef, editor.syncRootRef, ref ?? null],
		render,
	});
}
export function Composer({
	value,
	defaultValue,
	onValueChange,
	onSubmit,
	onQueryChange,
	onAction,
	triggers,
	disabled,
	readOnly,
	submitDisabled,
	allowEmpty,
	submitOnEnter,
	submitOnEmptySuggestions,
	getSuggestionsAnnouncement,
	working,
	onStop,
	...frame
}: ComposerProps): ReactElement {
	const stop = working ? onStop : undefined;
	const options: ComposerEditorOptions = {
		allowEmpty,
		defaultValue,
		disabled,
		getSuggestionsAnnouncement,
		onAction,
		onQueryChange,
		onSubmit,
		onValueChange,
		readOnly,
		submitDisabled: submitDisabled || stop !== undefined,
		submitOnEmptySuggestions,
		submitOnEnter,
		triggers,
		value,
	};
	return (
		<ComposerEditorProvider {...options}>
			<StopAction value={stop}>
				<ComposerFrame {...frame} data-working={working ? "" : undefined} />
			</StopAction>
		</ComposerEditorProvider>
	);
}

function tokenPortal(
	host: HTMLSpanElement,
	index: number,
	renderToken: ComposerInputProps["renderToken"]
): ReactNode {
	if (!host.parentElement) {
		return null;
	}
	const token = readComposerToken(host.parentElement);
	const content = renderToken?.(token) ?? <ComposerToken token={token} />;
	return createPortal(content, host, String(index));
}
export function ComposerInput({
	placeholder,
	renderToken,
	...external
}: Closed<
	useRender.ComponentProps<"div"> & {
		placeholder?: string;
		renderToken?: (token: ComposerTokenPart) => ReactNode;
	}
>): ReactElement {
	const editor = useComposerEditorContext();
	const suggestions = useComposerSuggestionsContext();
	const layout = useComposerInputLayout();
	if (!editor) {
		throw new Error("ComposerInput requires Composer.");
	}
	const { ref, ...events } = editor.inputProps;
	const semantics: ComponentProps<"div"> =
		external.render === undefined
			? {
					"aria-multiline": true,
					contentEditable: true,
					role: "textbox",
					suppressContentEditableWarning: true,
				}
			: {};
	const mode = editor.isTextarea
		? {
				contentEditable: undefined,
				disabled: editor.disabled,
				placeholder,
				readOnly: editor.readOnly,
			}
		: suggestions?.inputProps;
	const draft = useDivPart(
		"composer-input",
		external,
		mergeProps<"div">(
			{
				...presentation("input"),
				...semantics,
				"aria-placeholder": placeholder,
				...{
					"data-empty":
						!editor.isTextarea && editor.isEmpty && !editor.isComposing
							? ""
							: undefined,
				},
				...{ "data-placeholder": placeholder },
			},
			events,
			mode
		),
		[ref ?? null, layout.inputRef]
	);
	return (
		<>
			<ComposerScrollArea region="draft">{draft}</ComposerScrollArea>
			{editor.tokenHosts.map((host, index) =>
				tokenPortal(host, index, renderToken)
			)}
		</>
	);
}
export function ComposerToken({
	token,
	variant = "default",
	icon,
	children,
	...external
}: Closed<
	Omit<ComponentProps<"span">, "contentEditable"> & {
		token: ComposerTokenPart;
		variant?: ComposerTokenVariant;
		icon?: ReactNode;
	}
>): ReactElement {
	Reflect.deleteProperty(external, "data-slot");
	const chip = variant === "chip";
	const glyph =
		chip && icon ? (
			<span
				{...presentation("icon")}
				aria-hidden="true"
				data-slot="composer-token-icon"
			>
				{icon}
			</span>
		) : null;
	return (
		<span
			{...presentation(
				...(chip ? (["token", "chip"] as const) : (["token"] as const))
			)}
			contentEditable={false}
			data-kind={token.kind}
			data-slot="composer-token"
			data-type={token.type}
			data-variant={variant}
			{...external}
		>
			{glyph}
			<span data-slot="composer-token-label">
				{chip ? null : token.trigger}
				{children ?? token.label}
			</span>
		</span>
	);
}
export function ComposerPopup({
	portalProps,
	anchor,
	side = "top",
	align = "start",
	sideOffset = 4,
	alignOffset,
	...external
}: ComposerPopupProps): ReactElement {
	const editor = useComposerEditorContext();
	Reflect.deleteProperty(external, "data-slot");
	const focus = editor
		? {
				finalFocus: false as const,
				initialFocus: false as const,
				role: "presentation" as const,
			}
		: {};
	const panel = (
		<PopoverPrimitive.Popup
			{...presentation("popup")}
			data-slot="composer-popup"
			{...focus}
			{...external}
		/>
	);
	return (
		<PopoverPrimitive.Portal {...portalProps}>
			<PopoverPrimitive.Positioner
				{...presentation("positioner")}
				align={align}
				alignOffset={alignOffset}
				anchor={anchor ?? editor?.rootRef}
				data-slot="composer-positioner"
				side={side}
				sideOffset={sideOffset}
			>
				{panel}
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}
export function ComposerList({
	children,
	...external
}: Closed<
	Omit<useRender.ComponentProps<"div">, "children"> & {
		children?:
			| ReactNode
			| ((item: ComposerItemValue, index: number) => ReactNode);
	}
>): ReactElement {
	const options = useComposerSuggestionsContext();
	const content =
		typeof children === "function" ? options?.items.map(children) : children;
	const list = useDivPart(
		"composer-list",
		external,
		{
			...presentation("list"),
			"aria-label": options ? "Suggestions" : undefined,
			children: content,
			id: options?.listId,
			role: options ? "listbox" : undefined,
		},
		[options?.registerList ?? null]
	);
	return <ComposerScrollArea region="suggestions">{list}</ComposerScrollArea>;
}
export function ComposerItem({
	value,
	disabled,
	render,
	ref,
	...external
}: Closed<
	Omit<
		useRender.ComponentProps<
			"button",
			{ highlighted: boolean; disabled: boolean }
		>,
		"value"
	> & { value?: ComposerItemValue }
>): ReactElement {
	const unavailable = Boolean(disabled || value?.disabled);
	const option = useComposerItem(value, unavailable);
	Reflect.deleteProperty(external, "data-slot");
	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(
			{
				...option.props,
				...presentation("item"),
				...{ "data-slot": "composer-item" },
				disabled: unavailable,
				type: "button",
			},
			external
		),
		ref: [option.ref, ref ?? null],
		render,
		state: { disabled: unavailable, highlighted: option.highlighted },
	});
}
export function ComposerStatus(
	external: Closed<useRender.ComponentProps<"div">>
): ReactElement {
	return useDivPart("composer-status", external, {
		...presentation("status"),
		role: "status",
	});
}
export function ComposerActions(
	external: Closed<ComponentProps<"div">>
): ReactElement {
	const { "data-slot": _slot, ...rest } = external as ComponentProps<"div"> & {
		"data-slot"?: string;
	};
	return (
		<div {...presentation("actions")} data-slot="composer-actions" {...rest} />
	);
}
export function ComposerActionGroup({
	align = "start",
	...external
}: Closed<ComponentProps<"div"> & { align?: "start" | "end" }>): ReactElement {
	Reflect.deleteProperty(external, "data-slot");
	return (
		<div
			{...presentation("group", align)}
			data-align={align}
			data-slot="composer-action-group"
			{...external}
		/>
	);
}
function keepDraftFocus(
	event: PointerEvent<HTMLButtonElement>,
	root: HTMLElement | null | undefined
): void {
	if (event.button !== 0) {
		return;
	}
	const draft = root?.querySelector('[data-slot="composer-input"]');
	if (draft === event.currentTarget.ownerDocument.activeElement) {
		event.preventDefault();
	}
}
export function ComposerSubmit({
	disabled,
	render,
	ref,
	...external
}: Closed<Omit<ComponentProps<typeof ButtonPrimitive>, "type">>): ReactElement {
	const editor = useComposerEditorContext();
	const stop = useContext(StopAction);
	Reflect.deleteProperty(external, "data-slot");
	const unavailable = disabled ?? !editor?.canSubmit;
	function send(event: MouseEvent<HTMLButtonElement>): void {
		if (disabled || event.defaultPrevented) {
			return;
		}
		event.preventDefault();
		editor?.submit();
	}
	function halt(event: MouseEvent<HTMLButtonElement>): void {
		stop?.();
		event.currentTarget
			.closest('[data-slot="composer"]')
			?.querySelector<HTMLElement>('[data-slot="composer-input"]')
			?.focus();
	}
	const behavior = stop
		? { onClick: halt }
		: mergeProps<"button">(
				{
					disabled: unavailable,
					onClick: send,
					onPointerDown: (event) =>
						keepDraftFocus(event, editor?.rootRef.current),
				},
				external
			);
	const sendFace = (
		<Button
			aria-label="Send message"
			size="icon-sm"
			variant={unavailable ? "secondary" : "default"}
		>
			<IconArrowUp aria-hidden="true" size={18} />
		</Button>
	);
	const stopFace = (
		<Button aria-label="Stop" size="icon-sm">
			<IconPlayerStopFilled aria-hidden="true" size={14} />
		</Button>
	);
	return (
		<ButtonPrimitive
			data-slot="composer-submit"
			type="button"
			{...behavior}
			ref={ref}
			render={stop ? stopFace : (render ?? sendFace)}
		/>
	);
}
export type {
	ComposerContextCost,
	ComposerContextMeterProps,
	ComposerContextUsage,
} from "./composer-context-meter";
// biome-ignore lint/performance/noBarrelFile: The component entry point exposes its draft contract, editor hook, and parts.
export { ComposerContextMeter } from "./composer-context-meter";
export type { ComposerDictationProps } from "./composer-dictation";
export { ComposerDictation } from "./composer-dictation";
export {
	type ComposerChangeDetails,
	type ComposerItemValue,
	type ComposerPart,
	type ComposerQuery,
	type ComposerTokenPart,
	type ComposerTrigger,
	type ComposerTriggerState,
	type ComposerValue,
	getComposerText,
	useComposerContext,
	useComposerFilter,
} from "./composer-editor";
export type {
	ComposerAttachmentProps,
	ComposerAttachmentsProps,
	ComposerStatusBarGroupProps,
	ComposerStatusBarProps,
	ComposerStatusItemProps,
} from "./composer-parts";
export {
	ComposerAttachment,
	ComposerAttachments,
	ComposerStatusBar,
	ComposerStatusBarGroup,
	ComposerStatusItem,
} from "./composer-parts";
export type {
	ComposerPickerEffort,
	ComposerPickerOption,
	ComposerPickerProps,
} from "./composer-picker";
export { ComposerPicker } from "./composer-picker";
export type { ComposerPopupProps, ComposerTokenVariant };

export type ComposerInputProps = Closed<ComponentProps<typeof ComposerInput>>;
export type ComposerTokenProps = Closed<ComponentProps<typeof ComposerToken>>;
export type ComposerActionsProps = Closed<
	ComponentProps<typeof ComposerActions>
>;
export type ComposerActionGroupProps = Closed<
	ComponentProps<typeof ComposerActionGroup>
>;
export type ComposerSubmitProps = Closed<ComponentProps<typeof ComposerSubmit>>;
export type ComposerListProps = Closed<ComponentProps<typeof ComposerList>>;
export type ComposerItemProps = Closed<ComponentProps<typeof ComposerItem>>;
export type ComposerStatusProps = Closed<ComponentProps<typeof ComposerStatus>>;
