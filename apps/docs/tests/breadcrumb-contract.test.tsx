// @vitest-environment happy-dom

import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import type {
	BreadcrumbEllipsisProps,
	BreadcrumbItemProps,
	BreadcrumbLinkProps,
	BreadcrumbListProps,
	BreadcrumbPageProps,
	BreadcrumbProps,
	BreadcrumbSeparatorProps,
} from "../../../packages/ui/src/components/breadcrumb/breadcrumb";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../../../packages/ui/src/components/breadcrumb/breadcrumb";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
const contractChecks = [
	true satisfies Accepts<BreadcrumbProps, "className" | "style" | "ref">,
	true satisfies Accepts<BreadcrumbListProps, "className" | "style" | "ref">,
	true satisfies Accepts<BreadcrumbItemProps, "className" | "style" | "ref">,
	true satisfies Accepts<
		BreadcrumbLinkProps,
		"className" | "style" | "render" | "href"
	>,
	true satisfies Accepts<BreadcrumbPageProps, "className" | "style" | "ref">,
	true satisfies Accepts<
		BreadcrumbSeparatorProps,
		"children" | "className" | "style"
	>,
	true satisfies Accepts<
		BreadcrumbEllipsisProps,
		"className" | "style" | "ref"
	>,
] as const;

describe("Breadcrumb contract and semantics", () => {
	it("keeps current-page semantics", () => {
		const markup = renderToStaticMarkup(
			<Breadcrumb aria-label="Project trail">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator>/</BreadcrumbSeparator>
					<BreadcrumbItem>
						<BreadcrumbPage>Current</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
		expect(markup).toContain('aria-label="Project trail"');
		expect(markup).toContain('aria-current="page"');
		expect(markup).toContain('role="presentation"');
		expect(contractChecks.every(Boolean)).toBe(true);
	});

	it("renders hidden separator and ellipsis icons", () => {
		const markup = renderToStaticMarkup(
			<BreadcrumbList>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbEllipsis />
				</BreadcrumbItem>
			</BreadcrumbList>
		);
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain('data-slot="breadcrumb-ellipsis"');
		expect(markup.match(/<svg/gu)).toHaveLength(2);
	});

	it("forwards link refs and composes custom-link click handlers", () => {
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);
		const ref = createRef<HTMLAnchorElement>();
		const wrapperClick = vi.fn();
		const childClick = vi.fn();

		act(() =>
			root.render(
				<BreadcrumbLink
					onClick={wrapperClick}
					ref={ref}
					render={
						<a data-slot="overridden" href="/custom" onClick={childClick} />
					}
				>
					Custom
				</BreadcrumbLink>
			)
		);

		const link = container.querySelector("a");
		expect(link).not.toBeNull();
		expect(link?.getAttribute("href")).toBe("/custom");
		expect(link?.getAttribute("data-slot")).toBe("breadcrumb-link");
		expect(link?.textContent).toBe("Custom");
		expect(ref.current).toBe(link);
		act(() => link?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
		expect(wrapperClick).toHaveBeenCalledOnce();
		expect(childClick).toHaveBeenCalledOnce();

		act(() => root.unmount());
		container.remove();
	});
});
