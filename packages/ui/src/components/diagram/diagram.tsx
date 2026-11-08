"use client";

import { props } from "@stylexjs/stylex";
import type { Mounted } from "pele/core";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { useCallback, useId, useState } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { Spinner } from "../spinner/spinner";
import { diagramStyles } from "./diagram.styles";
import { mountDiagram } from "./diagram-renderer";
import "./diagram.css";

export type DiagramState = "loading" | "ready" | "error";
export type DiagramProps = Omit<
	Closed<ComponentPropsWithRef<"figure">>,
	"aria-label" | "children" | "dangerouslySetInnerHTML" | "data-slot" | "role"
> & {
	"aria-label": string;
	caption?: ReactNode;
	source: string;
	status?: DiagramState;
};

interface DiagramError {
	message: string;
	/** The source line with a caret under the problem, when Pele knows it. */
	snippet: string;
}

// Pele's PeleError carries the line, column, and a snippet with a caret.
function toDiagramError(error: unknown): DiagramError {
	if (!(error instanceof Error)) {
		return { message: "The diagram could not be rendered.", snippet: "" };
	}
	const {
		column = 0,
		line = 0,
		snippet = "",
	} = error as Error & {
		column?: number;
		line?: number;
		snippet?: string;
	};
	const message =
		line > 0
			? `Line ${line}, column ${column}`
			: (error.message.split("\n")[0] ?? error.message);
	return { message, snippet };
}

function Feedback({
	error,
	message,
	status,
}: {
	error?: DiagramError;
	message: string;
	status: DiagramState | "empty";
}) {
	return (
		<div
			data-slot="diagram-feedback"
			role={status === "error" ? "alert" : "status"}
			{...props(typeRoles.ui, diagramStyles.feedback)}
		>
			{status === "loading" && <Spinner aria-hidden="true" />}
			<p
				{...props(
					diagramStyles.feedbackTitle,
					status === "error" && diagramStyles.error
				)}
			>
				{message}
			</p>
			{error ? (
				<p {...props(diagramStyles.feedbackDetail)}>{error.message}</p>
			) : null}
			{error?.snippet ? (
				<pre {...props(typeRoles.mono, diagramStyles.snippet)}>
					{error.snippet}
				</pre>
			) : null}
		</div>
	);
}

function DiagramCanvas({ source }: { source: string }) {
	const prefix = useId().replace(/[^A-Za-z0-9_-]/gu, "");
	const [state, setState] = useState<{
		error?: DiagramError;
		status: DiagramState;
	}>({ status: "loading" });
	const attach = useCallback(
		(element: HTMLDivElement | null) => {
			if (!element) {
				return;
			}
			const controller = new AbortController();
			let view: Mounted | undefined;
			const onRender = () => {
				if (!controller.signal.aborted) {
					setState((current) =>
						current.status === "ready" ? current : { status: "ready" }
					);
				}
			};
			const onError = (error: unknown) => {
				if (!controller.signal.aborted) {
					setState({ error: toDiagramError(error), status: "error" });
				}
			};
			mountDiagram(
				element,
				source,
				{ idPrefix: `mizen-diagram-${prefix}`, onError, onRender },
				controller.signal
			)
				.then((mounted) => {
					if (controller.signal.aborted) {
						mounted?.destroy();
					} else {
						view = mounted;
					}
				})
				.catch(onError);
			return () => {
				controller.abort();
				view?.destroy();
			};
		},
		[source, prefix]
	);
	return (
		<div
			aria-busy={state.status === "loading" || undefined}
			data-slot="diagram-content"
			data-status={state.status}
			{...props(diagramStyles.content)}
		>
			{/* Not aria-hidden: Pele's zoom buttons live here and must stay reachable.
			    The figure's label names the diagram; Pele titles the SVG itself. */}
			<div
				data-slot="diagram-canvas"
				ref={attach}
				// Body size: Pele draws secondary labels (Gantt tasks, keys,
				// cardinalities) smaller than the base, and 16px keeps them at 12px.
				{...props(
					typeRoles.body,
					diagramStyles.canvas,
					state.status === "loading" && diagramStyles.canvasPending,
					state.status === "error" && diagramStyles.canvasFailed
				)}
			/>
			{state.status === "loading" ? (
				<div {...props(diagramStyles.overlay)}>
					<Feedback message="Rendering diagram" status="loading" />
				</div>
			) : null}
			{state.status === "error" ? (
				<Feedback
					error={state.error}
					message="Couldn't render this diagram"
					status="error"
				/>
			) : null}
		</div>
	);
}

function DiagramContent({
	source,
	status,
}: {
	source: string;
	status: DiagramState;
}) {
	if (status === "loading") {
		return <Feedback message="Loading diagram" status="loading" />;
	}
	if (status === "error") {
		return <Feedback message="Couldn't load this diagram" status="error" />;
	}
	if (!source.trim()) {
		return <Feedback message="No diagram to show" status="empty" />;
	}
	return <DiagramCanvas key={source} source={source} />;
}

export function Diagram({
	"aria-label": label,
	caption,
	source,
	status = "ready",
	ref,
	...rest
}: DiagramProps) {
	if (!label?.trim()) {
		throw new TypeError("Diagram requires a non-empty aria-label.");
	}
	if (typeof source !== "string") {
		throw new TypeError("Diagram source must be a string.");
	}
	if (!["loading", "ready", "error"].includes(status)) {
		throw new TypeError("Diagram status must be loading, ready, or error.");
	}
	for (const name of [
		"className",
		"style",
		"role",
		"data-slot",
		"children",
		"dangerouslySetInnerHTML",
	]) {
		Reflect.deleteProperty(rest, name);
	}
	return (
		<figure
			{...rest}
			aria-busy={status === "loading" || undefined}
			aria-label={label}
			data-slot="diagram"
			data-status={status}
			ref={ref}
			{...props(diagramStyles.root)}
		>
			<DiagramContent source={source} status={status} />
			{caption !== undefined && caption !== null && (
				<figcaption
					data-slot="diagram-caption"
					{...props(typeRoles.ui, diagramStyles.caption)}
				>
					{caption}
				</figcaption>
			)}
		</figure>
	);
}
