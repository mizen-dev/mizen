"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, Ref } from "react";
import { createContext, useContext } from "react";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import { avatarFallbackColors, avatarStyles } from "./avatar.styles";
import { characterStyles } from "./avatar-character.styles";

type BaseAvatarRootProps = ComponentPropsWithRef<typeof BaseAvatar.Root>;
type BaseAvatarImageProps = ComponentPropsWithRef<typeof BaseAvatar.Image>;
type BaseAvatarFallbackProps = ComponentPropsWithRef<
	typeof BaseAvatar.Fallback
>;
type NativeDivProps = ComponentPropsWithRef<"div">;

export type AvatarSize = "default" | "lg" | "sm";

export type AvatarProps = Omit<
	BaseAvatarRootProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseAvatarRootProps["ref"];
	size?: AvatarSize;
};

export type AvatarImageProps = Omit<
	BaseAvatarImageProps,
	"alt" | "className" | "data-slot" | "style"
> & {
	alt: string;
	ref?: BaseAvatarImageProps["ref"];
};

export type AvatarFallbackProps = Omit<
	BaseAvatarFallbackProps,
	"className" | "data-slot" | "style"
> & {
	color?: "neutral" | "blue" | "purple" | "green" | "orange";
	ref?: BaseAvatarFallbackProps["ref"];
};

export type AvatarGroupProps = Omit<
	NativeDivProps,
	"className" | "data-slot" | "style"
> & {
	size?: AvatarSize;
};

interface AvatarGroupContextValue {
	size: AvatarSize;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

const sizeStyles = {
	default: avatarStyles.defaultSize,
	lg: avatarStyles.lg,
	sm: avatarStyles.sm,
};

const groupOverlapStyles = {
	default: avatarStyles.groupOverlapDefault,
	lg: avatarStyles.groupOverlapLg,
	sm: avatarStyles.groupOverlapSm,
};

export function Avatar({
	ref: forwardedRef,
	render,
	size,
	...rest
}: AvatarProps) {
	const group = useContext(AvatarGroupContext);
	const resolvedSize = size ?? group?.size ?? "default";
	const isGrouped = group !== null;

	return (
		<BaseAvatar.Root
			{...rest}
			data-slot="avatar"
			ref={forwardedRef}
			render={protectRenderSlot("avatar", render)}
			{...props(
				avatarStyles.root,
				sizeStyles[resolvedSize],
				isGrouped && avatarStyles.groupRing,
				isGrouped && groupOverlapStyles[resolvedSize]
			)}
		/>
	);
}

export function AvatarGroup({
	children,
	ref: forwardedRef,
	size = "default",
	...rest
}: AvatarGroupProps) {
	return (
		<AvatarGroupContext value={{ size }}>
			<div
				{...rest}
				data-slot="avatar-group"
				ref={forwardedRef}
				{...props(avatarStyles.group)}
			>
				{children}
			</div>
		</AvatarGroupContext>
	);
}

export function AvatarImage({
	alt,
	ref: forwardedRef,
	render,
	...rest
}: AvatarImageProps) {
	return (
		<BaseAvatar.Image
			alt={alt}
			{...rest}
			data-slot="avatar-image"
			ref={forwardedRef}
			render={protectRenderSlot("avatar-image", render)}
			{...props(avatarStyles.image)}
		/>
	);
}

export function AvatarFallback({
	children,
	color = "neutral",
	ref: forwardedRef,
	render,
	...rest
}: AvatarFallbackProps) {
	return (
		<BaseAvatar.Fallback
			{...rest}
			data-slot="avatar-fallback"
			ref={forwardedRef}
			render={protectRenderSlot("avatar-fallback", render)}
			{...props(
				avatarStyles.fallback,
				color !== "neutral" && avatarFallbackColors[color]
			)}
		>
			{controlLabel(children)}
		</BaseAvatar.Fallback>
	);
}

export interface AvatarCharacterProps {
	/** Accessible name. Omit when adjacent text already names the identity. */
	label?: string;
	ref?: Ref<SVGSVGElement>;
	/** Stable identity key. Prefer an immutable ID over a display name. */
	seed: string;
	size?: AvatarSize;
}

const characterSizes = {
	default: avatarStyles.defaultSize,
	lg: avatarStyles.lg,
	sm: avatarStyles.sm,
};
const tones = [
	characterStyles.violet,
	characterStyles.blue,
	characterStyles.teal,
	characterStyles.green,
	characterStyles.amber,
	characterStyles.orange,
	characterStyles.rose,
	characterStyles.pink,
];
// Bodies rise from the bottom edge. `face` is the eye line.
const bodies = [
	{ d: "M7 52V31a17 17 0 0 1 34 0v21Z", face: 30 },
	{
		d: "M7 52V31a17 17 0 0 1 34 0v21ZM13 10a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm22 0a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z",
		face: 30,
	},
	{
		d: "M8 52V35a16 16 0 0 1 32 0v17ZM14 24V9a3.5 3.5 0 0 1 7 0v15Zm13 0V9a3.5 3.5 0 0 1 7 0v15Z",
		face: 34,
	},
	{ d: "M9 52V25c0-9 5-14 15-14s15 5 15 14v27Z", face: 27 },
	{
		d: "M7 52V31a17 17 0 0 1 34 0v21ZM24 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z",
		face: 31,
	},
	{ d: "M3 52V37c0-10 9-15 21-15s21 5 21 15v15Z", face: 35 },
	{
		d: "M7 52V30c0-6 1-12 3-17 1-3 4-3 6-1l5 5h6l5-5c2-2 5-2 6 1 2 5 3 11 3 17v22Z",
		face: 31,
	},
	{ d: "M12 52V22a12 12 0 0 1 24 0v30Z", face: 25 },
];
const eyeShapes = [
	(x: number, y: number) => <circle cx={x} cy={y} r="3" />,
	(x: number, y: number) => <ellipse cx={x} cy={y} rx="2.5" ry="3.6" />,
	(x: number, y: number) => (
		<path
			d={`M${x - 3} ${y + 1}q3-4.5 6 0`}
			{...props(characterStyles.stroke)}
		/>
	),
];

// FNV-1a over UTF-16 plus the murmur3 finalizer is fixed for v1.
// Changing either would change existing identities.
/* biome-ignore-start lint/suspicious/noBitwiseOperators: Hashing needs 32-bit XOR, shifts, and multiplies. */
function hashSeed(seed: string) {
	let hash = 2_166_136_261;
	for (let index = 0; index < seed.length; index += 1) {
		hash = Math.imul(hash ^ seed.charCodeAt(index), 16_777_619);
	}
	hash = Math.imul(hash ^ (hash >>> 16), 0x85_eb_ca_6b);
	hash = Math.imul(hash ^ (hash >>> 13), 0xc2_b2_ae_35);
	return (hash ^ (hash >>> 16)) >>> 0;
}
/* biome-ignore-end lint/suspicious/noBitwiseOperators: Hashing needs 32-bit XOR, shifts, and multiplies. */

export function AvatarCharacter({
	seed,
	label,
	size = "default",
	ref,
}: AvatarCharacterProps) {
	const hash = hashSeed(seed);
	const body = bodies[Math.floor(hash / 8) % bodies.length];
	const eye = eyeShapes[Math.floor(hash / 64) % eyeShapes.length];
	const x = 24 + ((Math.floor(hash / 192) % 3) - 1) * 1.5;
	const spread = Math.floor(hash / 576) % 2 ? 6.5 : 5;
	return (
		<svg
			aria-hidden={label ? undefined : true}
			aria-label={label}
			data-slot="avatar-character"
			focusable="false"
			ref={ref}
			role={label ? "img" : undefined}
			viewBox="0 0 48 48"
			{...props(
				characterStyles.root,
				characterSizes[size],
				tones[hash % tones.length]
			)}
		>
			<path d={body.d} {...props(characterStyles.body)} />
			<g {...props(characterStyles.face)}>
				{eye(x - spread, body.face)}
				{eye(x + spread, body.face)}
			</g>
		</svg>
	);
}
