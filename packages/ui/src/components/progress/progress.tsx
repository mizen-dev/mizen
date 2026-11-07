"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { protectRenderSlot } from "../../render-utils";
import { progressStyles } from "./progress.styles";

type BaseProgressRootProps = ComponentPropsWithRef<typeof BaseProgress.Root>;
type BaseProgressTrackProps = ComponentPropsWithRef<typeof BaseProgress.Track>;
type BaseProgressIndicatorProps = ComponentPropsWithRef<
	typeof BaseProgress.Indicator
>;
type BaseProgressLabelProps = ComponentPropsWithRef<typeof BaseProgress.Label>;
type BaseProgressValueProps = ComponentPropsWithRef<typeof BaseProgress.Value>;

export type ProgressProps = Omit<
	BaseProgressRootProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseProgressRootProps["ref"];
};

export type ProgressTrackProps = Omit<
	BaseProgressTrackProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseProgressTrackProps["ref"];
};

export type ProgressIndicatorProps = Omit<
	BaseProgressIndicatorProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseProgressIndicatorProps["ref"];
};

export type ProgressLabelProps = Omit<
	BaseProgressLabelProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseProgressLabelProps["ref"];
};

export type ProgressValueProps = Omit<
	BaseProgressValueProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseProgressValueProps["ref"];
};

export function Progress({
	children,
	locale = "en",
	ref: forwardedRef,
	render,
	...rest
}: ProgressProps) {
	return (
		<BaseProgress.Root
			locale={locale}
			{...rest}
			data-slot="progress"
			ref={forwardedRef}
			render={protectRenderSlot("progress", render)}
			{...props(progressStyles.root)}
		>
			{children ? (
				children
			) : (
				<ProgressTrack>
					<ProgressIndicator />
				</ProgressTrack>
			)}
		</BaseProgress.Root>
	);
}

export function ProgressTrack({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ProgressTrackProps) {
	return (
		<BaseProgress.Track
			{...rest}
			data-slot="progress-track"
			ref={forwardedRef}
			render={protectRenderSlot("progress-track", render)}
			{...props(progressStyles.track)}
		>
			{children}
		</BaseProgress.Track>
	);
}

export function ProgressIndicator({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ProgressIndicatorProps) {
	return (
		<BaseProgress.Indicator
			{...rest}
			data-slot="progress-indicator"
			ref={forwardedRef}
			render={protectRenderSlot("progress-indicator", render)}
			{...props(progressStyles.indicator)}
		>
			{children}
		</BaseProgress.Indicator>
	);
}

export function ProgressLabel({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ProgressLabelProps) {
	return (
		<BaseProgress.Label
			{...rest}
			data-slot="progress-label"
			ref={forwardedRef}
			render={protectRenderSlot("progress-label", render)}
			{...props(progressStyles.label)}
		>
			{children}
		</BaseProgress.Label>
	);
}

export function ProgressValue({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ProgressValueProps) {
	return (
		<BaseProgress.Value
			{...rest}
			data-slot="progress-value"
			ref={forwardedRef}
			render={protectRenderSlot("progress-value", render)}
			{...props(progressStyles.value)}
		>
			{children}
		</BaseProgress.Value>
	);
}
