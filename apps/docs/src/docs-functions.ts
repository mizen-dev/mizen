import { createServerFn } from "@tanstack/react-start";
import { getComponentPageData } from "./component-data.server";

export const loadComponent = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data }) => getComponentPageData(data));
