import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { IconFile, IconX } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { attachmentMarker } from "./attachment-marker.stylex";
import { composerPartStyles as styles } from "./composer-parts.styles";
import { ProgressRing } from "./composer-progress-ring";

type Part<T> = Omit<Closed<T>, "children" | "data-slot">;

export type ComposerAttachmentsProps = Part<ComponentPropsWithRef<"ul">> & {
	"aria-label"?: string;
	children: ReactNode;
};

/** The tray of files above the composer input. */
export function ComposerAttachments({
	"aria-label": ariaLabel = "Attachments",
	children,
	ref,
	...rest
}: ComposerAttachmentsProps) {
	return (
		<ul
			{...rest}
			aria-label={ariaLabel}
			data-slot="composer-attachments"
			ref={ref}
			{...props(styles.attachments)}
		>
			{children}
		</ul>
	);
}

export type ComposerAttachmentProps = Part<ComponentPropsWithRef<"li">> & {
	/** Opens the file in a new tab. */
	href?: string;
	name: string;
	/** Opens the file in place, such as an image in a Lightbox. */
	onOpen?: () => void;
	onRemove?: () => void;
	/** An image URL; files without one show their extension. */
	preview?: string;
	/** Upload share from 0 to 100; the tile dims until it reaches 100. */
	progress?: number;
};

function extensionOf(name: string) {
	const dot = name.lastIndexOf(".");
	return dot > 0 ? name.slice(dot + 1, dot + 5) : "file";
}

function RemoveButton({
	name,
	onRemove,
}: {
	name: string;
	onRemove?: () => void;
}) {
	if (!onRemove) {
		return null;
	}
	return (
		<button
			aria-label={`Remove ${name}`}
			onClick={onRemove}
			type="button"
			{...props(styles.attachmentRemove)}
		>
			<IconX aria-hidden="true" size={14} stroke={2.25} />
		</button>
	);
}

// Covers the tile, so the whole tile opens the file. Remove stays above it.
function OpenTarget({
	href,
	label,
	onOpen,
}: {
	href?: string;
	label: string;
	onOpen?: () => void;
}) {
	if (onOpen) {
		return (
			<button
				data-slot="composer-attachment-open"
				onClick={onOpen}
				type="button"
				{...props(styles.attachmentOpen)}
			>
				<VisuallyHidden>{label}</VisuallyHidden>
			</button>
		);
	}
	if (href) {
		return (
			<a
				data-slot="composer-attachment-open"
				href={href}
				rel="noopener noreferrer"
				target="_blank"
				{...props(styles.attachmentOpen)}
			>
				<VisuallyHidden>{label}, opens in a new tab</VisuallyHidden>
			</a>
		);
	}
	return <VisuallyHidden>{label}</VisuallyHidden>;
}

// A file shows its glyph and type; while uploading, a ring and its share.
function FileFace({ name, progress }: { name: string; progress?: number }) {
	const uploading = progress !== undefined && progress < 100;
	return (
		<>
			<span aria-hidden="true" {...props(styles.attachmentGlyph)}>
				{uploading ? (
					<ProgressRing share={progress / 100} />
				) : (
					<IconFile size={16} stroke={1.75} />
				)}
			</span>
			<span aria-hidden="true" {...props(styles.attachmentMeta)}>
				{uploading
					? `${Math.round(progress)}%`
					: extensionOf(name).toUpperCase()}
			</span>
		</>
	);
}

/** One file in the tray: a 56px tile with a thumbnail or the file's type. */
export function ComposerAttachment({
	href,
	name,
	onOpen,
	onRemove,
	preview,
	progress,
	ref,
	...rest
}: ComposerAttachmentProps) {
	const uploading = progress !== undefined && progress < 100;
	const label = uploading
		? `${name}, uploading ${Math.round(progress)}%`
		: name;
	return (
		<li
			{...rest}
			data-slot="composer-attachment"
			ref={ref}
			title={name}
			{...props(
				attachmentMarker,
				styles.attachment,
				Boolean(href || onOpen) && styles.attachmentOpenable
			)}
		>
			{preview ? (
				// biome-ignore lint/performance/noImgElement: Keep this UI component framework-neutral instead of coupling it to Next.js image optimization.
				<img
					alt=""
					height={56}
					src={preview}
					width={56}
					{...props(styles.attachmentImage)}
				/>
			) : (
				<FileFace name={name} progress={progress} />
			)}
			<OpenTarget href={href} label={label} onOpen={onOpen} />
			<RemoveButton name={name} onRemove={onRemove} />
		</li>
	);
}

export type ComposerStatusBarProps = Part<ComponentPropsWithRef<"div">> & {
	children: ReactNode;
};

/** A quiet row under the composer: where the agent works and how much room is left. */
export function ComposerStatusBar({
	children,
	ref,
	...rest
}: ComposerStatusBarProps) {
	return (
		<div
			{...rest}
			data-slot="composer-status-bar"
			ref={ref}
			{...props(styles.statusBar, typeRoles.ui)}
		>
			{children}
		</div>
	);
}

export type ComposerStatusBarGroupProps = ComposerStatusBarProps;

export function ComposerStatusBarGroup({
	children,
	ref,
	...rest
}: ComposerStatusBarGroupProps) {
	return (
		<div
			{...rest}
			data-slot="composer-status-bar-group"
			ref={ref}
			{...props(styles.statusBarGroup)}
		>
			{children}
		</div>
	);
}

export type ComposerStatusItemProps = Part<ComponentPropsWithRef<"button">> & {
	children: ReactNode;
};

/** One fact in the status bar, such as the branch; it can open a menu. */
export function ComposerStatusItem({
	children,
	ref,
	type = "button",
	...rest
}: ComposerStatusItemProps) {
	return (
		<button
			{...rest}
			data-slot="composer-status-item"
			ref={ref}
			type={type}
			{...props(styles.statusItem)}
		>
			{children}
		</button>
	);
}
