import { createContext } from "react";

// Share layout with composed groups without styling another component's internals.
export const ToolbarOrientationContext = createContext<
	"horizontal" | "vertical" | null
>(null);
