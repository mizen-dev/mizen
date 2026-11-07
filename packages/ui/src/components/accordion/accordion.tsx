"use client";

import type { AccordionRootProps } from "@base-ui/react/accordion";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { props } from "@stylexjs/stylex";
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactNode,
	useContext,
	useId,
} from "react";
import { controlLabel } from "../../control-label";
import { IconChevronDown } from "../../icons";
import { protectRenderSlot } from "../../render-utils";
import { accordionStyles, separatedAccordionStyles } from "./accordion.styles";

const AccordionVariantContext = createContext<"default" | "separated">(
	"default"
);

type BaseAccordionRootProps = ComponentPropsWithRef<typeof BaseAccordion.Root>;
type BaseAccordionItemProps = ComponentPropsWithRef<typeof BaseAccordion.Item>;
type BaseAccordionTriggerProps = ComponentPropsWithRef<
	typeof BaseAccordion.Trigger
>;
type BaseAccordionPanelProps = ComponentPropsWithRef<
	typeof BaseAccordion.Panel
>;

export type AccordionProps<Value = unknown> = Omit<
	AccordionRootProps<Value>,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseAccordionRootProps["ref"];
	variant?: "default" | "separated";
};

export type AccordionItemProps = Omit<
	BaseAccordionItemProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseAccordionItemProps["ref"];
};

export type AccordionTriggerProps = Omit<
	BaseAccordionTriggerProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseAccordionTriggerProps["ref"];
	description?: ReactNode;
	icon?: ReactNode;
};

export type AccordionPanelProps = Omit<
	BaseAccordionPanelProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseAccordionPanelProps["ref"];
};

function ChevronIcon() {
	return (
		<IconChevronDown
			aria-hidden="true"
			data-slot="accordion-indicator"
			focusable="false"
			{...props(accordionStyles.indicator)}
			size="1em"
		/>
	);
}

export function Accordion<Value = unknown>({
	ref: forwardedRef,
	render,
	variant = "default",
	...rest
}: AccordionProps<Value>) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<AccordionVariantContext.Provider value={variant}>
			<BaseAccordion.Root
				{...rest}
				data-slot="accordion"
				data-variant={variant}
				ref={forwardedRef}
				render={protectRenderSlot("accordion", render)}
				{...props(accordionStyles.root)}
			/>
		</AccordionVariantContext.Provider>
	);
}

export function AccordionItem({
	ref: forwardedRef,
	render,
	...rest
}: AccordionItemProps) {
	const separated = useContext(AccordionVariantContext) === "separated";
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAccordion.Item
			{...rest}
			data-slot="accordion-item"
			ref={forwardedRef}
			render={protectRenderSlot("accordion-item", render)}
			{...props(
				accordionStyles.item,
				separated && separatedAccordionStyles.item
			)}
		/>
	);
}

export function AccordionTrigger({
	children,
	description,
	icon,
	"aria-describedby": describedBy,
	ref: forwardedRef,
	render,
	...rest
}: AccordionTriggerProps) {
	const separated = useContext(AccordionVariantContext) === "separated";
	const descriptionId = useId();
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAccordion.Header
			data-slot="accordion-header"
			{...props(
				accordionStyles.header,
				separated && separatedAccordionStyles.header
			)}
		>
			<BaseAccordion.Trigger
				{...rest}
				aria-describedby={
					description
						? [describedBy, descriptionId].filter(Boolean).join(" ")
						: describedBy
				}
				data-slot="accordion-trigger"
				ref={forwardedRef}
				render={protectRenderSlot("accordion-trigger", render)}
				{...props(
					accordionStyles.trigger,
					separated && separatedAccordionStyles.trigger
				)}
			>
				{icon ? (
					<span
						aria-hidden="true"
						data-slot="accordion-icon"
						{...props(accordionStyles.icon)}
					>
						{icon}
					</span>
				) : null}
				<span {...props(accordionStyles.triggerText)}>
					<span data-slot="accordion-title" {...props(accordionStyles.title)}>
						{controlLabel(children)}
					</span>
					{description ? (
						<span
							aria-hidden="true"
							data-slot="accordion-description"
							id={descriptionId}
							{...props(accordionStyles.description)}
						>
							{description}
						</span>
					) : null}
				</span>
				<ChevronIcon />
			</BaseAccordion.Trigger>
		</BaseAccordion.Header>
	);
}

export function AccordionPanel({
	children,
	ref: forwardedRef,
	render,
	...rest
}: AccordionPanelProps) {
	const separated = useContext(AccordionVariantContext) === "separated";
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAccordion.Panel
			{...rest}
			data-slot="accordion-panel"
			ref={forwardedRef}
			render={protectRenderSlot("accordion-panel", render)}
			{...props(accordionStyles.panel)}
		>
			<div
				data-slot="accordion-content"
				{...props(
					accordionStyles.content,
					separated && separatedAccordionStyles.content
				)}
			>
				{children}
			</div>
		</BaseAccordion.Panel>
	);
}
export const AccordionPrimitive = BaseAccordion;
