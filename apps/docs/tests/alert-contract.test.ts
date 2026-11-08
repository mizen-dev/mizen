import type {
	AlertActionProps,
	AlertDescriptionProps,
	AlertIconProps,
	AlertProps,
	AlertTitleProps,
	AlertVariant,
} from "@mizen-labs/ui/alert";
import type { ComponentPropsWithRef, RefObject } from "react";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "../../../packages/ui/src/components/alert/alert";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type ClosedProps<Props, Element extends "div" | "span"> = Exact<
	Exclude<keyof ComponentPropsWithRef<Element>, keyof Props>,
	"className" | "style"
>;

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

type ExpectedVariant = "default" | "error" | "info" | "success" | "warning";

const variants: readonly AlertVariant[] = [
	"default",
	"error",
	"info",
	"success",
	"warning",
] as const;

const contractChecks = [
	true satisfies Exact<AlertVariant, ExpectedVariant>,

	true satisfies ClosedProps<AlertProps, "div">,
	false satisfies Accepts<AlertProps, "className">,
	false satisfies Accepts<AlertProps, "style">,
	false satisfies Accepts<AlertProps, "data-slot">,
	true satisfies Accepts<AlertProps, "variant">,
	true satisfies Accepts<AlertProps, "role">,
	true satisfies Accepts<AlertProps, "ref">,

	true satisfies ClosedProps<AlertIconProps, "span">,
	false satisfies Accepts<AlertIconProps, "className">,
	false satisfies Accepts<AlertIconProps, "style">,
	false satisfies Accepts<AlertIconProps, "data-slot">,
	true satisfies Accepts<AlertIconProps, "aria-hidden">,
	true satisfies Accepts<AlertIconProps, "ref">,

	true satisfies ClosedProps<AlertTitleProps, "div">,
	false satisfies Accepts<AlertTitleProps, "className">,
	false satisfies Accepts<AlertTitleProps, "style">,
	false satisfies Accepts<AlertTitleProps, "data-slot">,
	true satisfies Accepts<AlertTitleProps, "ref">,

	true satisfies ClosedProps<AlertDescriptionProps, "div">,
	false satisfies Accepts<AlertDescriptionProps, "className">,
	false satisfies Accepts<AlertDescriptionProps, "style">,
	false satisfies Accepts<AlertDescriptionProps, "data-slot">,
	true satisfies Accepts<AlertDescriptionProps, "ref">,

	true satisfies ClosedProps<AlertActionProps, "div">,
	false satisfies Accepts<AlertActionProps, "className">,
	false satisfies Accepts<AlertActionProps, "style">,
	false satisfies Accepts<AlertActionProps, "data-slot">,
	true satisfies Accepts<AlertActionProps, "ref">,
] as const;

const expectedContractChecks = [
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	false,
	false,
	false,
	true,
] as const;

describe("Alert component contract and SSR semantics", () => {
	it("resolves root and subpath exports with exact closed prop contracts", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/alert")).toContain(
			"packages/ui/dist/components/alert/alert.js"
		);
		expect(contractChecks).toEqual(expectedContractChecks);
	});

	it("renders default role='alert', default variant='default', and protected slots", () => {
		const markup = renderToStaticMarkup(
			createElement(
				Alert,
				null,
				createElement(AlertIcon, null, createElement("svg")),
				createElement(AlertTitle, null, "Attention"),
				createElement(AlertDescription, null, "Please verify."),
				createElement(
					AlertAction,
					null,
					createElement("button", { type: "button" }, "Action")
				)
			)
		);
		expect(markup).toContain('data-slot="alert"');
		expect(markup).toContain('data-variant="default"');
		expect(markup).toContain('role="alert"');
		expect(markup).toContain('data-slot="alert-icon"');
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain('data-slot="alert-title"');
		expect(markup).toContain('data-slot="alert-description"');
		expect(markup).toContain('data-slot="alert-action"');
	});

	it("protects data-slot and data-variant from consumer override", () => {
		type MaliciousAlertProps = AlertProps & {
			"data-slot"?: string;
			"data-variant"?: string;
		};
		const maliciousAlertProps: MaliciousAlertProps = {
			"data-slot": "custom-alert-slot",
			"data-variant": "custom-variant",
			variant: "error",
		};
		const alertMarkup = renderToStaticMarkup(
			createElement(Alert, maliciousAlertProps)
		);
		expect(alertMarkup).toContain('data-slot="alert"');
		expect(alertMarkup).toContain('data-variant="error"');
		expect(alertMarkup).not.toContain("custom-alert-slot");
		expect(alertMarkup).not.toContain("custom-variant");

		type MaliciousIconProps = AlertIconProps & { "data-slot"?: string };
		const maliciousIconProps: MaliciousIconProps = {
			"data-slot": "custom-icon-slot",
		};
		const iconMarkup = renderToStaticMarkup(
			createElement(AlertIcon, maliciousIconProps)
		);
		expect(iconMarkup).toContain('data-slot="alert-icon"');
		expect(iconMarkup).not.toContain("custom-icon-slot");

		type MaliciousSlotProps = AlertTitleProps & { "data-slot"?: string };
		const maliciousSlotProps: MaliciousSlotProps = {
			"data-slot": "custom-slot",
		};
		const titleMarkup = renderToStaticMarkup(
			createElement(AlertTitle, maliciousSlotProps)
		);
		expect(titleMarkup).toContain('data-slot="alert-title"');
		expect(titleMarkup).not.toContain("custom-slot");

		const descMarkup = renderToStaticMarkup(
			createElement(AlertDescription, maliciousSlotProps)
		);
		expect(descMarkup).toContain('data-slot="alert-description"');
		expect(descMarkup).not.toContain("custom-slot");

		const actionMarkup = renderToStaticMarkup(
			createElement(AlertAction, maliciousSlotProps)
		);
		expect(actionMarkup).toContain('data-slot="alert-action"');
		expect(actionMarkup).not.toContain("custom-slot");
	});

	it("allows overriding native role to status or region", () => {
		const statusMarkup = renderToStaticMarkup(
			createElement(Alert, { role: "status" })
		);
		expect(statusMarkup).toContain('role="status"');

		const regionMarkup = renderToStaticMarkup(
			createElement(Alert, {
				"aria-labelledby": "alert-heading",
				role: "region",
			})
		);
		expect(regionMarkup).toContain('role="region"');
		expect(regionMarkup).toContain('aria-labelledby="alert-heading"');
	});

	it("allows overriding AlertIcon aria-hidden", () => {
		const overrideMarkup = renderToStaticMarkup(
			createElement(AlertIcon, { "aria-hidden": false })
		);
		expect(overrideMarkup).toContain('aria-hidden="false"');
	});

	it("forwards refs on all five components", () => {
		const alertRef: RefObject<HTMLDivElement | null> =
			createRef<HTMLDivElement>();
		const iconRef: RefObject<HTMLSpanElement | null> =
			createRef<HTMLSpanElement>();
		const titleRef: RefObject<HTMLDivElement | null> =
			createRef<HTMLDivElement>();
		const descRef: RefObject<HTMLDivElement | null> =
			createRef<HTMLDivElement>();
		const actionRef: RefObject<HTMLDivElement | null> =
			createRef<HTMLDivElement>();

		const markup = renderToStaticMarkup(
			createElement(
				Alert,
				{ ref: alertRef },
				createElement(AlertIcon, { ref: iconRef }),
				createElement(AlertTitle, { ref: titleRef }, "Ref Title"),
				createElement(AlertDescription, { ref: descRef }, "Ref Desc"),
				createElement(AlertAction, { ref: actionRef })
			)
		);
		expect(markup).toContain('data-slot="alert"');
		expect(markup).toContain("Ref Title");
	});

	it("renders all five SSR semantic variants with children", () => {
		for (const variant of variants) {
			const markup = renderToStaticMarkup(
				createElement(
					Alert,
					{ variant },
					createElement(AlertTitle, null, `${variant} title`),
					createElement(AlertDescription, null, `${variant} message`)
				)
			);
			expect(markup).toContain(`data-variant="${variant}"`);
			expect(markup).toContain(`${variant} title`);
			expect(markup).toContain(`${variant} message`);
		}
	});
});
