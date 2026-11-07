"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import { toastStyles } from "./toast.styles";
import type { ToastData, ToastPosition } from "./toast.types";
import { anchoredToastStyles } from "./toast-anchored.styles";
import { toastAnimationStyles } from "./toast-animation.styles";
import { StatusIcon } from "./toast-icons";
import { toastStackedStyles } from "./toast-stacked.styles";
import {
	getPositionSwipeDirections,
	getUpdateAnimation,
	isTopPosition,
	resolveSideOffset,
} from "./toast-utils";

type ToastItem = BaseToast.Root.ToastObject<ToastData>;

const posStyles = {
	"bottom-center": toastStyles.bottomCenter,
	"bottom-left": toastStyles.bottomLeft,
	"bottom-right": toastStyles.bottomRight,
	"top-center": toastStyles.topCenter,
	"top-left": toastStyles.topLeft,
	"top-right": toastStyles.topRight,
} as const;

const animStyles = {
	"pulse-even": toastAnimationStyles.pulseEven,
	"pulse-odd": toastAnimationStyles.pulseOdd,
	"shake-even": toastAnimationStyles.shakeEven,
	"shake-odd": toastAnimationStyles.shakeOdd,
} as const;

type AnimationStyle = (typeof animStyles)[keyof typeof animStyles] | null;

function renderToastAction(actionProps: ComponentPropsWithRef<"button">) {
	return <button {...actionProps}>{controlLabel(actionProps.children)}</button>;
}

function getStackedRootProps(isTop: boolean, animStyle?: AnimationStyle) {
	const stylexProps = props(
		toastStyles.surface,
		toastStackedStyles.root,
		isTop ? toastStackedStyles.rootTop : toastStackedStyles.rootBottom,
		animStyle
	);
	return {
		...stylexProps,
		style: {
			...stylexProps.style,
			zIndex: "calc(1000 - var(--toast-index, 0))",
		},
	};
}

export function ToastStackedView({
	position,
}: {
	readonly position: ToastPosition;
}) {
	const { toasts } = BaseToast.useToastManager<ToastData>();
	const isTop = isTopPosition(position);
	const swipeDirection = getPositionSwipeDirections(position);

	return (
		<BaseToast.Viewport
			data-slot="toast-viewport"
			{...props(toastStyles.viewport, posStyles[position])}
		>
			{toasts.map((toast) => {
				const animation = getUpdateAnimation(toast.type, toast.updateKey);
				const animStyle = animation ? animStyles[animation] : null;
				return (
					<BaseToast.Root
						{...toast.data?.rootProps}
						data-slot="toast-root"
						data-update-animation={animation}
						key={toast.id}
						render={protectRenderSlot(
							"toast-root",
							toast.data?.rootProps?.render
						)}
						swipeDirection={swipeDirection}
						toast={toast}
						{...getStackedRootProps(isTop, animStyle)}
					>
						<BaseToast.Content
							data-slot="toast-content"
							{...props(toastStyles.content, toastStackedStyles.content)}
						>
							<StatusIcon type={toast.type} />
							<div {...props(toastStyles.body)}>
								<BaseToast.Title
									data-slot="toast-title"
									dir="auto"
									{...props(toastStyles.title)}
								/>
								<BaseToast.Description
									data-slot="toast-description"
									dir="auto"
									{...props(toastStyles.description)}
								/>
							</div>
							{toast.actionProps ? (
								<BaseToast.Action
									data-slot="toast-action"
									render={renderToastAction}
									{...props(toastStyles.action)}
								/>
							) : null}
						</BaseToast.Content>
					</BaseToast.Root>
				);
			})}
		</BaseToast.Viewport>
	);
}

function AnchoredTooltipRoot({ toast }: { readonly toast: ToastItem }) {
	const animation = getUpdateAnimation(toast.type, toast.updateKey);
	const animStyle = animation ? animStyles[animation] : null;
	return (
		<BaseToast.Root
			{...toast.data?.rootProps}
			data-slot="toast-popup"
			data-update-animation={animation}
			render={protectRenderSlot("toast-popup", toast.data?.rootProps?.render)}
			toast={toast}
			{...props(
				toastStyles.surface,
				anchoredToastStyles.tooltipRoot,
				animStyle
			)}
		>
			<BaseToast.Content
				data-slot="toast-content"
				{...props(anchoredToastStyles.tooltipContent)}
			>
				<BaseToast.Title
					data-slot="toast-title"
					dir="auto"
					{...props(anchoredToastStyles.tooltipTitle)}
				/>
			</BaseToast.Content>
		</BaseToast.Root>
	);
}

function AnchoredStandardRoot({ toast }: { readonly toast: ToastItem }) {
	const animation = getUpdateAnimation(toast.type, toast.updateKey);
	const animStyle = animation ? animStyles[animation] : null;
	return (
		<BaseToast.Root
			{...toast.data?.rootProps}
			data-slot="toast-popup"
			data-update-animation={animation}
			render={protectRenderSlot("toast-popup", toast.data?.rootProps?.render)}
			toast={toast}
			{...props(toastStyles.surface, anchoredToastStyles.root, animStyle)}
		>
			<BaseToast.Content
				data-slot="toast-content"
				{...props(anchoredToastStyles.content)}
			>
				<StatusIcon type={toast.type} />
				<div {...props(toastStyles.body)}>
					<BaseToast.Title
						data-slot="toast-title"
						dir="auto"
						{...props(toastStyles.title)}
					/>
					<BaseToast.Description
						data-slot="toast-description"
						dir="auto"
						{...props(toastStyles.description)}
					/>
				</div>
				{toast.actionProps ? (
					<BaseToast.Action
						data-slot="toast-action"
						render={renderToastAction}
						{...props(toastStyles.action)}
					/>
				) : null}
			</BaseToast.Content>
		</BaseToast.Root>
	);
}

export function AnchoredToastView() {
	const { toasts } = BaseToast.useToastManager<ToastData>();

	return (
		<BaseToast.Viewport
			data-slot="toast-viewport-anchored"
			{...props(anchoredToastStyles.viewport)}
		>
			{toasts.map((toast) =>
				toast.positionerProps?.anchor ? (
					<BaseToast.Positioner
						data-slot="toast-positioner"
						key={toast.id}
						toast={toast}
						{...toast.positionerProps}
						sideOffset={resolveSideOffset(toast.positionerProps?.sideOffset)}
						{...props(anchoredToastStyles.positioner)}
					>
						{toast.data?.tooltipStyle ? (
							<AnchoredTooltipRoot toast={toast} />
						) : (
							<AnchoredStandardRoot toast={toast} />
						)}
					</BaseToast.Positioner>
				) : null
			)}
		</BaseToast.Viewport>
	);
}
