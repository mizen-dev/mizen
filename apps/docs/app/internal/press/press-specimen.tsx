"use client";

import {
	Button,
	ButtonGroup,
	Heading,
	Stack,
	Text,
	Toggle,
	ToggleGroup,
	ToggleGroupItem,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { IconBold, IconItalic, IconPlus } from "@tabler/icons-react";
import { pressStyles as s } from "./press-specimen.styles";

const variants = [
	"default",
	"brand",
	"secondary",
	"outline",
	"ghost",
	"destructive",
	"destructive-outline",
] as const;

const sizes = ["xs", "sm", "default", "lg", "xl"] as const;

// Internal review surface for press feedback. Each target sits in a padded cell
// so captures include the full surface and its shadow.
export function PressSpecimen() {
	return (
		<div {...props(s.page)}>
			<Stack gap="2">
				<Heading level={1} size="title">
					Press surfaces
				</Heading>
				<Text size="ui" tone="muted">
					Hover and press each control. The surface responds; the label stays
					still.
				</Text>
			</Stack>
			<section aria-label="Variants">
				<div {...props(s.row)}>
					{variants.map((variant) => (
						<div data-press-target={variant} key={variant} {...props(s.cell)}>
							<Button variant={variant}>{variant}</Button>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Sizes">
				<div {...props(s.row)}>
					{sizes.map((size) => (
						<div
							data-press-target={`size-${size}`}
							key={size}
							{...props(s.cell)}
						>
							<Button size={size}>Size {size}</Button>
						</div>
					))}
					<div data-press-target="icon" {...props(s.cell)}>
						<Button aria-label="Add" size="icon">
							<IconPlus aria-hidden="true" size="1em" />
						</Button>
					</div>
				</div>
			</section>
			<section aria-label="Wide">
				<div {...props(s.row)}>
					<div data-press-target="wide" {...props(s.cell)}>
						<div {...props(s.wide)}>
							<Button>Continue to payment</Button>
						</div>
					</div>
					<div data-press-target="wide-ghost" {...props(s.cell)}>
						<div {...props(s.wide)}>
							<Button variant="ghost">Skip for now</Button>
						</div>
					</div>
				</div>
			</section>
			<section aria-label="Groups">
				<div {...props(s.row)}>
					<div data-press-target="button-group" {...props(s.cell)}>
						<ButtonGroup aria-label="History">
							<Button variant="outline">Undo</Button>
							<Button variant="outline">Redo</Button>
							<Button variant="outline">Reset</Button>
						</ButtonGroup>
					</div>
					<div data-press-target="toggle" {...props(s.cell)}>
						<Toggle aria-label="Bold">
							<IconBold aria-hidden="true" size="1em" />
						</Toggle>
					</div>
					<div data-press-target="toggle-outline" {...props(s.cell)}>
						<Toggle aria-label="Italic" defaultPressed variant="outline">
							<IconItalic aria-hidden="true" size="1em" />
						</Toggle>
					</div>
					<div data-press-target="toggle-group" {...props(s.cell)}>
						<ToggleGroup
							aria-label="Alignment"
							defaultValue={["Left"]}
							variant="outline"
						>
							<ToggleGroupItem value="Left">Left</ToggleGroupItem>
							<ToggleGroupItem value="Center">Center</ToggleGroupItem>
							<ToggleGroupItem value="Right">Right</ToggleGroupItem>
						</ToggleGroup>
					</div>
				</div>
			</section>
			<p {...props(s.label)}>Internal specimen; not part of the public docs.</p>
		</div>
	);
}
