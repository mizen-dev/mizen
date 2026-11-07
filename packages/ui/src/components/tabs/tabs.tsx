"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, createContext, useContext } from "react";
import { controlLabel } from "../../control-label";
import { tabsStyles } from "./tabs.styles";

type BaseTabsProps = ComponentPropsWithRef<typeof BaseTabs.Root>;
type BaseTabsIndicatorProps = ComponentPropsWithRef<typeof BaseTabs.Indicator>;
type BaseTabsListProps = ComponentPropsWithRef<typeof BaseTabs.List>;
type BaseTabsPanelProps = ComponentPropsWithRef<typeof BaseTabs.Panel>;
type BaseTabsTabProps = ComponentPropsWithRef<typeof BaseTabs.Tab>;

export type TabsSize = "default" | "lg" | "sm";
export type TabsVariant = "default" | "underline";

export type TabsProps = Omit<
	BaseTabsProps,
	"className" | "ref" | "render" | "style"
> & {
	ref?: BaseTabsProps["ref"];
};

export type TabsListProps = Omit<
	BaseTabsListProps,
	"className" | "ref" | "render" | "style"
> & {
	ref?: BaseTabsListProps["ref"];
	size?: TabsSize;
	variant?: TabsVariant;
};

export type TabsTabProps = Omit<
	BaseTabsTabProps,
	"className" | "nativeButton" | "ref" | "render" | "style"
> & {
	ref?: BaseTabsTabProps["ref"];
};

export type TabsIndicatorProps = Omit<
	BaseTabsIndicatorProps,
	"className" | "ref" | "render" | "style"
> & {
	ref?: BaseTabsIndicatorProps["ref"];
};

export type TabsPanelProps = Omit<
	BaseTabsPanelProps,
	"className" | "ref" | "render" | "style"
> & {
	ref?: BaseTabsPanelProps["ref"];
};

interface TabsListContextValue {
	size: TabsSize;
	variant: TabsVariant;
}

const defaultTabsListContext: TabsListContextValue = {
	size: "default",
	variant: "default",
};
const TabsListContext = createContext(defaultTabsListContext);

const sizeStyles = {
	default: tabsStyles.sizeDefault,
	lg: tabsStyles.sizeLg,
	sm: tabsStyles.sizeSm,
};

export function Tabs({
	orientation = "horizontal",
	ref: forwardedRef = undefined,
	...rest
}: TabsProps) {
	return (
		<BaseTabs.Root
			{...rest}
			data-slot="tabs"
			orientation={orientation}
			ref={forwardedRef}
			{...props(
				orientation === "horizontal"
					? tabsStyles.rootHorizontal
					: tabsStyles.rootVertical
			)}
		/>
	);
}

export function TabsList({
	children,
	ref: forwardedRef = undefined,
	size = "default",
	variant = "default",
	...rest
}: TabsListProps) {
	return (
		<TabsListContext value={{ size, variant }}>
			<BaseTabs.List
				{...rest}
				data-slot="tabs-list"
				ref={forwardedRef}
				{...props(
					tabsStyles.list,
					variant === "default"
						? tabsStyles.listDefault
						: tabsStyles.listUnderline
				)}
			>
				{children}
				<Indicator automatic />
			</BaseTabs.List>
		</TabsListContext>
	);
}

export function TabsTab({
	children,
	ref: forwardedRef = undefined,
	type,
	...rest
}: TabsTabProps) {
	const { size, variant } = useContext(TabsListContext);

	return (
		<BaseTabs.Tab
			{...rest}
			data-slot="tabs-tab"
			ref={forwardedRef}
			type={type ?? "button"}
			{...props(
				tabsStyles.tab,
				sizeStyles[size],
				variant === "default"
					? tabsStyles.activeDefault
					: tabsStyles.activeUnderline
			)}
		>
			{controlLabel(children)}
		</BaseTabs.Tab>
	);
}

export function TabsIndicator(input: TabsIndicatorProps) {
	return <Indicator {...input} />;
}

function Indicator({
	automatic = false,
	ref: forwardedRef = undefined,
	...rest
}: TabsIndicatorProps & { automatic?: boolean }) {
	const { variant } = useContext(TabsListContext);

	return (
		<BaseTabs.Indicator
			{...rest}
			data-auto-indicator={automatic || undefined}
			data-slot="tabs-indicator"
			ref={forwardedRef}
			{...props(
				tabsStyles.indicator,
				automatic && tabsStyles.automaticIndicator,
				variant === "default"
					? tabsStyles.indicatorDefault
					: tabsStyles.indicatorUnderline
			)}
		/>
	);
}

export function TabsPanel({
	ref: forwardedRef = undefined,
	...rest
}: TabsPanelProps) {
	return (
		<BaseTabs.Panel
			{...rest}
			data-slot="tabs-panel"
			ref={forwardedRef}
			{...props(tabsStyles.panel)}
		/>
	);
}
