---
name: "Color Swatch"
title: "Color Swatch"
description: "Display and select a color, including transparency."
order: 1020
layout: document
---

# Color Swatch

`<cb-color-swatch>` · `@beforesemicolon/cube/styling/color-swatch`

:::component
<cb-color-swatch value="#7c3aed" label="Purple" variant="round" selected="true"></cb-color-swatch>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/styling--color-swatch)

Use `value` for a hex color (`#RGB`, `#RGBA`, `#RRGGBB`, or `#RRGGBBAA`).
A checkerboard shows through transparent colors. `variant` accepts `boxy`
(default) or `round`, and `size` accepts the standard component sizes.

The swatch emits an `action` event with `{ value, originalEvent }` on click,
Enter, or Space. Update `selected` in your application to indicate the active
color. `disabled` prevents activation; `label` or `accessible-label` names
the button. Without a label, the color value is its accessible name.

Style the `preview`, `color`, and `button` CSS parts. Set
`--component-color-swatch-size` for a custom square size, or
`--component-color-swatch-radius` for custom boxy corners.

## Color options

Provide `options` to turn a swatch into a selectable palette. Use color strings,
or objects with `value`, an optional accessible `label`, and optional `disabled`.
The palette uses `value` for the selected color; `selected` only applies to a
single swatch. Set `options` to an empty array to return to single-swatch mode.

```js
swatch.options = [
  { value: '#2563eb', label: 'Blue' },
  { value: '#7c3aed', label: 'Purple' },
  { value: '#16a34a', label: 'Green', disabled: true },
  '#00000000',
]
swatch.value = '#7c3aed'
swatch.addEventListener('change', event => {
  const { value, previousValue } = event.detail
})
```

Options also accept a JSON array through the `options` attribute. Palette
selection emits one `change` with `{ value, previousValue, originalEvent }`;
choosing the current color emits nothing. Arrow keys, Home, and End navigate
and select enabled colors. `beforechange` can cancel a selection.

Set `name` to submit the color through a native form. Form reset and disabled
fieldsets are supported. Set `--component-color-swatch-gap` to adjust palette
spacing; the palette wraps when space is limited.
