import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { expect } from "vite-plus/test";

// How every element under `selector` renders: its size, box and text face.
// Positions are left out, because the reset removes the page margin and so
// moves everything. `box-sizing` is left out too: the size shows its effect.
function look(selector: string) {
	const box = [
		"marginTop",
		"marginRight",
		"marginBottom",
		"marginLeft",
		"paddingTop",
		"paddingRight",
		"paddingBottom",
		"paddingLeft",
		"borderTopWidth",
		"borderRightWidth",
		"borderBottomWidth",
		"borderLeftWidth",
		"color",
		"backgroundColor",
		"display",
		"listStyleType",
		"textDecorationLine",
		"appearance",
	] as const;
	const face = [
		"fontFamily",
		"fontSize",
		"fontWeight",
		"lineHeight",
		"letterSpacing",
	] as const;
	const read = (style: CSSStyleDeclaration, names: readonly string[]) =>
		names.map((name) => style.getPropertyValue(name) || style[name as "color"]);
	// A pseudo-element that renders has content; its size shows its box model.
	const pseudo = (element: Element, name: string) => {
		const style = getComputedStyle(element, name);
		return style.content === "none" ? null : [style.width, style.height];
	};
	return [...document.querySelectorAll(selector)].map((element) => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		const hasText = [...element.childNodes].some(
			(node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
		);
		// A text field shows its font; a checkbox or an icon button shows none.
		const isTextField = element.matches(
			"input:not([type='checkbox'], [aria-hidden='true']), select, textarea"
		);
		return {
			after: pseudo(element, "::after"),
			before: pseudo(element, "::before"),
			box: read(style, box),
			// An element without text of its own shows no font.
			face: hasText || isTextField ? read(style, face) : null,
			height: Math.round(rect.height * 100) / 100,
			name: `${element.tagName.toLowerCase()} ${element.getAttribute("data-slot") ?? ""}`,
			width: Math.round(rect.width * 100) / 100,
		};
	});
}

type Look = ReturnType<typeof look>[number];

const focusRing = () => {
	const style = getComputedStyle(document.activeElement ?? document.body);
	return [style.outlineStyle, style.outlineWidth, style.outlineOffset];
};

const settle = async () => {
	await Promise.allSettled(
		document.getAnimations().map((animation) => animation.finished)
	);
};

// Resolves when an element has kept its drawn size for five frames. A popup
// scales in, and a size read during that motion differs between two runs.
const atRest = (selector: string) =>
	new Promise<void>((resolve) => {
		const element = document.querySelector(selector);
		let last = "";
		let frames = 0;
		const read = () => {
			const { height, width } = element?.getBoundingClientRect() ?? {};
			const size = `${width}x${height}`;
			frames = size === last ? frames + 1 : 0;
			last = size;
			if (frames < 5) {
				requestAnimationFrame(read);
				return;
			}
			resolve();
		};
		read();
	});

async function readProbe(browser: Browser, url: string) {
	const page = await browser.newPage({
		viewport: { height: 900, width: 1280 },
	});
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto(url, { waitUntil: "networkidle" });
	const app = await page.evaluate(look, '[data-testid="app-markup"] *');
	const mizen = await page.evaluate(look, '[data-testid="mizen-markup"] *');
	const reading = {
		app: Object.fromEntries(app.map((entry) => [entry.name.trim(), entry])),
		bodyMargin: await page.evaluate(
			() => getComputedStyle(document.body).margin
		),
		dialog: [] as Look[],
		errors,
		linkFocus: [] as string[],
		mizen,
		mizenFocus: [] as string[],
		plainBox: await page
			.getByTestId("plain-box")
			.evaluate((element) => element.getBoundingClientRect().width),
	};
	await exerciseProbe(page, reading);
	await page.close();
	return reading;
}

// Keyboard focus, native form behavior and the overlay.
async function exerciseProbe(
	page: Page,
	reading: { dialog: Look[]; linkFocus: string[]; mizenFocus: string[] }
) {
	await page.keyboard.press("Tab");
	await expectLocator(
		page.getByRole("link", { name: "plain link" })
	).toBeFocused();
	reading.linkFocus = await page.evaluate(focusRing);
	await page.getByLabel("Plain input").fill("Typed");
	await expectLocator(page.getByLabel("Plain input")).toHaveValue("Typed");
	await page.getByLabel("Plain checkbox").check();
	await expectLocator(page.getByLabel("Plain checkbox")).toBeChecked();
	await page.getByLabel("Mizen input").fill("Typed");
	await expectLocator(page.getByLabel("Mizen input")).toHaveValue("Typed");
	await page.keyboard.press("Shift+Tab");
	await expectLocator(page.locator('a[href="#mizen-link"]')).toBeFocused();
	await page.evaluate(settle);
	reading.mizenFocus = await page.evaluate(focusRing);
	await page.getByRole("button", { name: "Open dialog" }).click();
	await expectLocator(
		page.getByRole("dialog", { name: "Mizen dialog" })
	).toBeVisible();
	await page.evaluate(settle);
	await page.evaluate(atRest, '[role="dialog"]');
	reading.dialog = await page.evaluate(
		look,
		'[role="dialog"], [role="dialog"] *'
	);
}

type Reading = Awaited<ReturnType<typeof readProbe>>;

// Browser defaults the reset must leave alone, with it and without it.
function expectKeptDefaults(reading: Reading) {
	const { app } = reading;
	const [, headingSize, headingWeight] = app.h2?.face ?? [];
	expect([headingSize, headingWeight]).toEqual(["24px", "700"]);
	expect(app.h2?.box[0]).not.toBe("0px");
	expect(app.ul?.box[15]).toBe("disc");
	expect(app.ul?.box[7]).toBe("40px");
	expect(app.a?.box[16]).toBe("underline");
	expect(app.a?.box[12]).not.toBe(app.p?.box[12]);
	expect(reading.linkFocus[0]).not.toBe("none");
	expect(reading.mizenFocus[0]).not.toBe("none");
	expect(reading.errors).toEqual([]);
}

// The packed reset, measured on a page with no consumer CSS: what it changes
// in the application's own markup, and that Mizen's markup does not need it.
export async function verifyReset(origin: string): Promise<void> {
	const browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		headless: true,
	});
	try {
		const without = await readProbe(browser, `${origin}/without-reset`);
		const reset = await readProbe(browser, `${origin}/with-reset`);

		expectKeptDefaults(without);
		expectKeptDefaults(reset);
		expect(reset.app.a).toEqual(without.app.a);
		expect(reset.linkFocus).toEqual(without.linkFocus);

		// Without the reset the browser defaults stand.
		expect(without.bodyMargin).toBe("8px");
		expect(without.plainBox).toBe(130);
		expect(without.app.button?.face).not.toEqual(without.app.p?.face);

		// With it the page meets the viewport edge, sizes include padding and
		// border, and a control uses the font of the text around it.
		expect(reset.bodyMargin).toBe("0px");
		expect(reset.plainBox).toBe(100);
		expect(reset.app.button?.face).toEqual(reset.app.p?.face);

		// Mizen's own markup renders the same either way.
		expect(reset.mizen).toEqual(without.mizen);
		expect(reset.dialog).toEqual(without.dialog);
		expect(reset.mizenFocus).toEqual(without.mizenFocus);
		expect(without.dialog.length).toBeGreaterThan(4);
	} finally {
		await browser.close();
	}
}
