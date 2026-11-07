import type { ResolvedTheme, ThemePreference, ThemeStorage } from "./types";
import { isThemePreference } from "./types";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
export const DEFAULT_STORAGE_KEY = "mizen-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function readStorage(storage: ThemeStorage, key: string): string | null {
	try {
		return storage.getItem(key);
	} catch (error) {
		if (error instanceof DOMException) {
			return null;
		}
		throw error;
	}
}

function writeStorage(storage: ThemeStorage, key: string, value: string): void {
	try {
		storage.setItem(key, value);
	} catch (error) {
		if (error instanceof DOMException) {
			return;
		}
		throw error;
	}
}

export const defaultBrowserStorage: ThemeStorage = {
	getItem(key: string): string | null {
		if (typeof window === "undefined") {
			return null;
		}
		try {
			return window.localStorage.getItem(key);
		} catch (error) {
			if (error instanceof DOMException) {
				return null;
			}
			throw error;
		}
	},
	setItem(key: string, value: string): void {
		if (typeof window === "undefined") {
			return;
		}
		try {
			window.localStorage.setItem(key, value);
		} catch (error) {
			if (error instanceof DOMException) {
				return;
			}
			throw error;
		}
	},
};

export interface PreferenceStore {
	readonly getServerSnapshot: () => ThemePreference;
	readonly getSnapshot: () => ThemePreference;
	readonly setPreference: (next: ThemePreference) => void;
	readonly subscribe: (onStoreChange: () => void) => () => void;
}

interface CustomEventPayload {
	readonly preference: ThemePreference;
	readonly sourceId: symbol;
	readonly storage: unknown;
}

const sharedPreferenceStore = new WeakMap<
	ThemeStorage,
	Map<string, ThemePreference>
>();

function getSharedPreference(
	storage: ThemeStorage,
	key: string
): ThemePreference | undefined {
	if (typeof window === "undefined") {
		return undefined;
	}
	return sharedPreferenceStore.get(storage)?.get(key);
}

function setSharedPreference(
	storage: ThemeStorage,
	key: string,
	preference: ThemePreference
): void {
	if (typeof window === "undefined") {
		return;
	}
	let keyMap = sharedPreferenceStore.get(storage);
	if (!keyMap) {
		keyMap = new Map();
		sharedPreferenceStore.set(storage, keyMap);
	}
	keyMap.set(key, preference);
}

function isCustomPayload(value: unknown): value is CustomEventPayload {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	const preference = Reflect.get(value, "preference");
	const sourceId = Reflect.get(value, "sourceId");
	return (
		isThemePreference(preference) &&
		typeof sourceId === "symbol" &&
		Reflect.has(value, "storage")
	);
}

function resolveCurrentPreference(
	storage: ThemeStorage,
	storageKey: string,
	defaultTheme: ThemePreference
): ThemePreference {
	const shared = getSharedPreference(storage, storageKey);
	if (shared !== undefined) {
		return shared;
	}
	const raw = readStorage(storage, storageKey);
	if (isThemePreference(raw)) {
		return raw;
	}
	return defaultTheme;
}

export function createPreferenceStore(
	storage: ThemeStorage,
	storageKey: string,
	defaultTheme: ThemePreference
): PreferenceStore {
	const listeners = new Set<() => void>();
	const eventName = `mizen-theme:${storageKey}`;
	const storeId = Symbol("storeId");

	let memoryPreference: ThemePreference = resolveCurrentPreference(
		storage,
		storageKey,
		defaultTheme
	);

	const notify = () => {
		for (const listener of listeners) {
			listener();
		}
	};

	const subscribe = (onStoreChange: () => void): (() => void) => {
		listeners.add(onStoreChange);

		const handleStorage = (event: StorageEvent) => {
			if (
				storage !== defaultBrowserStorage ||
				(event.storageArea !== null &&
					event.storageArea !== window.localStorage) ||
				(event.key !== storageKey && event.key !== null)
			) {
				return;
			}
			const next = isThemePreference(event.newValue)
				? event.newValue
				: defaultTheme;
			setSharedPreference(storage, storageKey, next);
			memoryPreference = next;
			onStoreChange();
		};

		const handleCustomEvent = (event: Event) => {
			const { detail } = event as CustomEvent<unknown>;
			if (
				isCustomPayload(detail) &&
				detail.sourceId !== storeId &&
				detail.storage === storage
			) {
				setSharedPreference(storage, storageKey, detail.preference);
				memoryPreference = detail.preference;
				onStoreChange();
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorage);
			window.addEventListener(eventName, handleCustomEvent);
		}

		const latest = resolveCurrentPreference(storage, storageKey, defaultTheme);
		if (memoryPreference !== latest) {
			memoryPreference = latest;
			onStoreChange();
		}

		return () => {
			listeners.delete(onStoreChange);
			if (typeof window !== "undefined") {
				window.removeEventListener("storage", handleStorage);
				window.removeEventListener(eventName, handleCustomEvent);
			}
		};
	};

	const getSnapshot = (): ThemePreference => memoryPreference;

	const getServerSnapshot = (): ThemePreference => defaultTheme;

	const setPreference = (next: ThemePreference): void => {
		memoryPreference = next;
		setSharedPreference(storage, storageKey, next);
		writeStorage(storage, storageKey, next);
		notify();
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent(eventName, {
					detail: { preference: next, sourceId: storeId, storage },
				})
			);
		}
	};

	return {
		getServerSnapshot,
		getSnapshot,
		setPreference,
		subscribe,
	};
}

export function subscribeSystem(callback: () => void): () => void {
	if (
		typeof window === "undefined" ||
		typeof window.matchMedia === "undefined"
	) {
		return () => undefined;
	}
	const media = window.matchMedia(DARK_MEDIA_QUERY);
	media.addEventListener("change", callback);
	return () => media.removeEventListener("change", callback);
}

export function getSystemSnapshot(): ResolvedTheme {
	if (
		typeof window === "undefined" ||
		typeof window.matchMedia === "undefined"
	) {
		return "light";
	}
	return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function getServerSystemSnapshot(): ResolvedTheme {
	return "light";
}
