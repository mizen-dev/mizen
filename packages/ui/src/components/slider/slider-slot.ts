export function stripForbidden<T extends object>(target: T): T {
	Reflect.deleteProperty(target, "className");
	Reflect.deleteProperty(target, "data-slot");
	Reflect.deleteProperty(target, "readOnly");
	Reflect.deleteProperty(target, "style");
	return target;
}
