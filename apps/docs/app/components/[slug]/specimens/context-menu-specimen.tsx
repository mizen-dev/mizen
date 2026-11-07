"use client";

import {
	Badge,
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuGroup,
	ContextMenuGroupLabel,
	ContextMenuItem,
	ContextMenuLinkItem,
	ContextMenuPopup,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubPopup,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
	DirectionProvider,
	darkTheme,
	Heading,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { IconFile } from "@tabler/icons-react";
import { useRef, useSyncExternalStore } from "react";
import { specimenStyles } from "./context-menu-specimen.styles";

function FileIcon() {
	return <IconFile aria-hidden="true" focusable="false" size="20" />;
}

function subscribeDirection(callback: () => void): () => void {
	if (typeof MutationObserver === "undefined") {
		return () => undefined;
	}
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, {
		attributeFilter: ["dir"],
		attributes: true,
	});
	return () => observer.disconnect();
}

function getDirectionSnapshot(): "ltr" | "rtl" {
	return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
}

function getServerDirectionSnapshot(): "ltr" | "rtl" {
	return "ltr";
}

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function subscribeDark(callback: () => void): () => void {
	if (
		typeof window === "undefined" ||
		typeof window.matchMedia === "undefined"
	) {
		return () => undefined;
	}
	const media = window.matchMedia(DARK_MEDIA_QUERY);
	media.addEventListener("change", callback);
	return () => media.removeEventListener("change", callback);
}

function getDarkSnapshot(): boolean {
	return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

function getServerDarkSnapshot(): boolean {
	return false;
}

export function ContextMenuSpecimen() {
	const direction = useSyncExternalStore(
		subscribeDirection,
		getDirectionSnapshot,
		getServerDirectionSnapshot
	);
	const isDark = useSyncExternalStore(
		subscribeDark,
		getDarkSnapshot,
		getServerDarkSnapshot
	);
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<DirectionProvider direction={direction}>
			<div
				dir={direction}
				ref={containerRef}
				{...props(
					specimenStyles.container,
					isDark && darkTheme,
					isDark && specimenStyles.darkSurface
				)}
			>
				<Stack>
					<Heading dir="ltr" level={2}>
						File workspace actions
					</Heading>
					<Text dir="ltr">
						Context Menu attaches actions to pointer coordinates or long press
						on a semantic target surface.
					</Text>

					<ContextMenu>
						<ContextMenuTrigger
							render={
								// biome-ignore lint/a11y/useAriaPropsSupportedByRole: target surface models a file asset
								<div
									aria-label="Project file asset: schema.config.json"
									// biome-ignore lint/a11y/noNoninteractiveTabindex: focusable target surface
									tabIndex={0}
									{...props(specimenStyles.targetRegion)}
								/>
							}
						>
							<div {...props(specimenStyles.fileCard)}>
								<div {...props(specimenStyles.fileHeader)}>
									<div {...props(specimenStyles.fileIcon)}>
										<FileIcon />
									</div>
									<div {...props(specimenStyles.fileMeta)}>
										<span dir="ltr" {...props(specimenStyles.fileName)}>
											schema.config.json
										</span>
										<span dir="ltr" {...props(specimenStyles.fileDetails)}>
											JSON Schema · 4.8 KB · Staged
										</span>
									</div>
								</div>
								<Badge variant="brand">Staged</Badge>
							</div>

							<div {...props(specimenStyles.instructions)}>
								<span dir="ltr" {...props(specimenStyles.instructionPrimary)}>
									Right-click or press and hold to open contextual actions
								</span>
							</div>
						</ContextMenuTrigger>

						<ContextMenuPopup portalProps={{ container: containerRef }}>
							<ContextMenuGroup>
								<ContextMenuGroupLabel>File actions</ContextMenuGroupLabel>
								<ContextMenuItem>
									Edit file
									<ContextMenuShortcut dir="ltr">⌘E</ContextMenuShortcut>
								</ContextMenuItem>
								<ContextMenuItem>
									Copy relative path
									<ContextMenuShortcut dir="ltr">⌥⌘C</ContextMenuShortcut>
								</ContextMenuItem>
								<ContextMenuItem disabled>Revert to commit</ContextMenuItem>
								<ContextMenuLinkItem href="/components/menu">
									View menu docs
								</ContextMenuLinkItem>
							</ContextMenuGroup>

							<ContextMenuSeparator />

							<ContextMenuGroup>
								<ContextMenuGroupLabel>Settings</ContextMenuGroupLabel>
								<ContextMenuCheckboxItem defaultChecked>
									Track modifications
								</ContextMenuCheckboxItem>
								<ContextMenuCheckboxItem variant="switch">
									Format on save
								</ContextMenuCheckboxItem>
							</ContextMenuGroup>

							<ContextMenuSeparator />

							<ContextMenuGroup>
								<ContextMenuGroupLabel inset>
									Validation mode
								</ContextMenuGroupLabel>
								<ContextMenuRadioGroup defaultValue="strict">
									<ContextMenuRadioItem value="strict">
										Strict
									</ContextMenuRadioItem>
									<ContextMenuRadioItem value="lax">Lax</ContextMenuRadioItem>
									<ContextMenuRadioItem value="off">Off</ContextMenuRadioItem>
								</ContextMenuRadioGroup>
							</ContextMenuGroup>

							<ContextMenuSeparator />

							<ContextMenuSub>
								<ContextMenuSubTrigger>Export as</ContextMenuSubTrigger>
								<ContextMenuSubPopup portalProps={{ container: containerRef }}>
									<ContextMenuItem>Production bundle</ContextMenuItem>
									<ContextMenuItem>Source archive tarball</ContextMenuItem>
									<ContextMenuItem>TypeScript declaration</ContextMenuItem>
								</ContextMenuSubPopup>
							</ContextMenuSub>

							<ContextMenuSeparator />

							<ContextMenuItem variant="destructive">
								Delete file
								<ContextMenuShortcut dir="ltr">⌫</ContextMenuShortcut>
							</ContextMenuItem>
						</ContextMenuPopup>
					</ContextMenu>
				</Stack>
			</div>
		</DirectionProvider>
	);
}
