import { createServerFn } from "@tanstack/react-start";
import { getGuide } from "../model/guides";
import { getComponentPageData } from "./component-data.server";
import { getDocsNavigation } from "./navigation-data.server";

export const loadNavigation = createServerFn({ method: "GET" }).handler(() =>
	getDocsNavigation()
);

export const loadGuide = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => getGuide(data));

export const loadComponent = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => getComponentPageData(data));
