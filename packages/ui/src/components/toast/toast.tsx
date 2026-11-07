"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import type {
	AnchoredToastProviderProps,
	ToastData,
	ToastProviderProps,
} from "./toast.types";
import { AnchoredToastView, ToastStackedView } from "./toast-views";

export type {
	AnchoredToastProviderProps,
	ToastPosition,
	ToastProviderProps,
} from "./toast.types";

export const ToastPrimitive = BaseToast;

export const toastManager = BaseToast.createToastManager<ToastData>();
export const anchoredToastManager = BaseToast.createToastManager<ToastData>();

export function ToastProvider({
	children,
	position = "bottom-right",
	portalProps,
	toastManager: customManager,
	...restProps
}: ToastProviderProps) {
	return (
		<BaseToast.Provider
			{...restProps}
			toastManager={customManager ?? toastManager}
		>
			{children}
			<BaseToast.Portal data-slot="toast-portal" {...portalProps}>
				<ToastStackedView position={position} />
			</BaseToast.Portal>
		</BaseToast.Provider>
	);
}

export function AnchoredToastProvider({
	children,
	portalProps,
	toastManager: customManager,
	...restProps
}: AnchoredToastProviderProps) {
	return (
		<BaseToast.Provider
			{...restProps}
			toastManager={customManager ?? anchoredToastManager}
		>
			{children}
			<BaseToast.Portal data-slot="toast-portal-anchored" {...portalProps}>
				<AnchoredToastView />
			</BaseToast.Portal>
		</BaseToast.Provider>
	);
}
