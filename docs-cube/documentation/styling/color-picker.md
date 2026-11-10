---
name: "Color Picker"
title: "Color Picker"
description: "Edit a color using a swatch, sliders, or channel fields. Use `allow-alpha` when opacity is part of the value."
order: 1021
layout: document
---

# Color Picker

Edit a color using a swatch, sliders, or channel fields. Use `allow-alpha` when opacity is part of the value.

`<cb-color-picker>` · `@beforesemicolon/cube/styling/color-picker`

:::component
<cb-color-picker accessible-label="Fill color" value="#7139cf" allow-alpha="true"></cb-color-picker>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/styling--color-picker)

## Transparent colors

When a color is fully transparent, choosing a new color through the color plane,
hue slider, or HSV/RGB channels makes it opaque. Partially transparent colors
retain their alpha. Alpha controls, HEX input, swatches, and programmatic values
continue to support explicit full transparency.

## Saved swatches

Pass saved hex colors through `swatches` on color pickers and gradient editors. Storage belongs to the host application: listen for the bubbling, composed `swatchadd`, `swatchupdate`, and `swatchremove` events, persist `event.detail.swatches`, and supply the updated palette to every picker. Gradient-stop pickers forward the same events.

Set `add-swatch-label` to enable adding the current color. Set `update-swatch-label` to enable replacing a selected saved swatch after changing its color. Delete or Backspace removes a focused swatch. The corresponding `beforeswatchadd`, `beforeswatchupdate`, and `beforeswatchremove` events are cancelable. Update details include `previousValue` as well as the new `value` and complete `swatches` array.
