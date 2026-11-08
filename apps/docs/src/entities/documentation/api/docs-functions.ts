import { createServerFn } from "@tanstack/react-start";
import { validateSlug } from "../lib/validate-slug";
import { getGuide } from "../model/guides";
import { getComponentPageData } from "./component-data.server";
import { getDocsNavigation } from "./navigation-data.server";

export const loadNavigation = createServerFn({ method: "GET" }).handler(() =>
	getDocsNavigation()
);

export const loadGuide = createServerFn({ method: "GET" })
	.validator(validateSlug)
	.handler(({ data }) => getGuide(data));

export const loadComponent = createServerFn({ method: "GET" })
	.validator(validateSlug)
	.handler(({ data }) => getComponentPageData(data));
