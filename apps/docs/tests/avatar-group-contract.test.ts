// @vitest-environment happy-dom

import type { ReactElement, ReactNode } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	type AvatarGroupProps,
	type AvatarSize,
} from "../../../packages/ui/src/components/avatar/avatar";
import { avatarStyles } from "../../../packages/ui/src/components/avatar/avatar.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { controlSize } from "../../../packages/ui/src/styles/dimensions.stylex";
import { space } from "../../../packages/ui/src/styles/spacing.stylex";

const propsSpy = vi.fn((..._args: unknown[]) => ({}));

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: (...args: unknown[]) => propsSpy(...args),
	when: { ancestor: () => ":where(*)" },
}));

const avatarGroupDivPattern = /^<div[^>]*data-slot="avatar-group"/;

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

type Rejects<Props, Key extends PropertyKey> = Key extends keyof Props
	? false
	: true;

const contractChecks = [
	true satisfies Exact<AvatarSize, "default" | "lg" | "sm">,
	true satisfies Rejects<AvatarGroupProps, "className">,
	true satisfies Rejects<AvatarGroupProps, "style">,
	true satisfies Rejects<AvatarGroupProps, "data-slot">,
	true satisfies Rejects<AvatarGroupProps, "render">,
	true satisfies Rejects<AvatarGroupProps, "max">,
	true satisfies Rejects<AvatarGroupProps, "total">,
	true satisfies Rejects<AvatarGroupProps, "overflow">,
	true satisfies Rejects<AvatarGroupProps, "direction">,
	true satisfies Rejects<AvatarGroupProps, "spacing">,
	true satisfies Accepts<AvatarGroupProps, "size">,
	true satisfies Accepts<AvatarGroupProps, "role">,
	true satisfies Accepts<AvatarGroupProps, "aria-label">,
	true satisfies Accepts<AvatarGroupProps, "children">,
	true satisfies Accepts<AvatarGroupProps, "ref">,
] as const;

type MaliciousGroupComp = (props: {
	children?: ReactNode;
	"data-slot"?: string;
	role?: string;
}) => ReactElement;

describe("AvatarGroup contract and runtime semantics", () => {
	beforeEach(() => {
		propsSpy.mockClear();
	});

	it("enforces closed prop contracts on AvatarGroup", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("renders a native div with protected avatar-group data-slot", () => {
		const markup = renderToStaticMarkup(
			h(AvatarGroup, null, h(Avatar, null, h(AvatarFallback, null, "A")))
		);
		expect(markup).toMatch(avatarGroupDivPattern);
		expect(markup).toContain('data-slot="avatar"');
	});

	it("protects data-slot against direct prop overrides", () => {
		const markup = renderToStaticMarkup(
			h(
				AvatarGroup as MaliciousGroupComp,
				{ "data-slot": "malicious-group" },
				h(Avatar, null, h(AvatarFallback, null, "A"))
			)
		);
		expect(markup).toContain('data-slot="avatar-group"');
		expect(markup).not.toContain("malicious-group");
	});

	it("passes through explicit role and aria-label without defaulting role", () => {
		const withoutRole = renderToStaticMarkup(
			h(AvatarGroup, null, h(Avatar, null, h(AvatarFallback, null, "A")))
		);
		expect(withoutRole).not.toContain("role=");

		const withRole = renderToStaticMarkup(
			h(
				AvatarGroup,
				{ "aria-label": "Team Members", role: "group" },
				h(Avatar, null, h(AvatarFallback, null, "A"))
			)
		);
		expect(withRole).toContain('role="group"');
		expect(withRole).toContain('aria-label="Team Members"');
	});

	it("forwards ref to the host div element", async () => {
		const container = document.createElement("div");
		const root = createRoot(container);
		const groupRef = createRef<HTMLDivElement>();

		await act(() =>
			root.render(
				h(
					AvatarGroup,
					{ ref: groupRef },
					h(Avatar, null, h(AvatarFallback, null, "A"))
				)
			)
		);
		expect(groupRef.current?.dataset.slot).toBe("avatar-group");
		expect(groupRef.current?.tagName).toBe("DIV");
		await act(() => root.unmount());
	});

	it("inherits default group size in nested Avatar and applies ring and overlap", () => {
		renderToStaticMarkup(
			h(AvatarGroup, null, h(Avatar, null, h(AvatarFallback, null, "A")))
		);
		expect(propsSpy).toHaveBeenCalledWith(avatarStyles.group);
		expect(propsSpy).toHaveBeenCalledWith(
			avatarStyles.root,
			avatarStyles.defaultSize,
			avatarStyles.groupRing,
			avatarStyles.groupOverlapDefault
		);
	});

	it("inherits explicit group sizes in nested Avatars", () => {
		renderToStaticMarkup(
			h(
				AvatarGroup,
				{ size: "lg" },
				h(Avatar, null, h(AvatarFallback, null, "L"))
			)
		);
		expect(propsSpy).toHaveBeenCalledWith(
			avatarStyles.root,
			avatarStyles.lg,
			avatarStyles.groupRing,
			avatarStyles.groupOverlapLg
		);

		propsSpy.mockClear();
		renderToStaticMarkup(
			h(
				AvatarGroup,
				{ size: "sm" },
				h(Avatar, null, h(AvatarFallback, null, "S"))
			)
		);
		expect(propsSpy).toHaveBeenCalledWith(
			avatarStyles.root,
			avatarStyles.sm,
			avatarStyles.groupRing,
			avatarStyles.groupOverlapSm
		);
	});

	it("allows nested Avatar to override group size", () => {
		renderToStaticMarkup(
			h(
				AvatarGroup,
				{ size: "lg" },
				h(Avatar, { size: "sm" }, h(AvatarFallback, null, "S"))
			)
		);
		expect(propsSpy).toHaveBeenCalledWith(
			avatarStyles.root,
			avatarStyles.sm,
			avatarStyles.groupRing,
			avatarStyles.groupOverlapSm
		);
	});

	it("protects standalone Avatar from grouped styles and size regressions", () => {
		renderToStaticMarkup(h(Avatar, null, h(AvatarFallback, null, "A")));
		expect(propsSpy).toHaveBeenCalledWith(
			avatarStyles.root,
			avatarStyles.defaultSize,
			false,
			false
		);
	});

	it("maps outer separation ring and 12.5% overlap styles to semantic tokens", () => {
		expect(avatarStyles.groupRing).toMatchObject({
			boxShadow: `0 0 0 2px ${colors.surface}`,
		});
		expect(avatarStyles.groupOverlapSm).toMatchObject({
			marginInlineStart: {
				":not(:first-child)": `calc(-0.125 * ${controlSize["2xs"]})`,
				default: space["0"],
			},
		});
		expect(avatarStyles.groupOverlapDefault).toMatchObject({
			marginInlineStart: {
				":not(:first-child)": `calc(-0.125 * ${controlSize.sm})`,
				default: space["0"],
			},
		});
		expect(avatarStyles.groupOverlapLg).toMatchObject({
			marginInlineStart: {
				":not(:first-child)": `calc(-0.125 * ${controlSize.lg})`,
				default: space["0"],
			},
		});
		expect(avatarStyles.group).toMatchObject({
			alignItems: "center",
			boxSizing: "border-box",
			display: "inline-flex",
			flexDirection: "row",
		});
	});
});
