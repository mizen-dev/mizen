import type { Menu as BaseMenu } from "@base-ui/react/menu";
import { type ComponentProps, createContext } from "react";

// A menubar aligns its menus with the start of their triggers, like desktop
// menubars; standalone menus keep Base UI's centered default.
export const MenuAlignContext = createContext<
	ComponentProps<typeof BaseMenu.Positioner>["align"] | undefined
>(undefined);
