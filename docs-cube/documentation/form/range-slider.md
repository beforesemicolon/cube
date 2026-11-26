---
name: "Range Slider"
title: "Range Slider"
description: "Adjust a numeric value within a range. Set `min`, `max`, and `step` to define the available values."
order: 237
layout: document
---

# Range Slider

Adjust a numeric value within a range. Set `min`, `max`, and `step` to define the available values.

`<cb-range-slider>` · `@beforesemicolon/cube/form/range-slider`

:::component
<cb-range-slider accessible-label="Opacity" min="0" max="100" step="5" value="50">
</cb-range-slider>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--range-slider)

## Pick an interval

Use `variant="double"` to select a lower and upper value on one track. Each
thumb can be dragged or adjusted with the keyboard. Clicking or tapping the
track moves the nearest thumb. The thumbs can meet, but cannot cross.

:::component
<cb-range-slider variant="double" accessible-label="Installation rate"
  start-label="Minimum installation rate" end-label="Maximum installation rate"
  min="0" max="20" step="0.5" start-value="4" end-value="12">
</cb-range-slider>
:::

| Property | Attribute | Behavior |
| --- | --- | --- |
| `variant` | `variant` | `single` (default) or `double`. |
| `value` | `value` | The existing scalar value for single mode. |
| `startValue`, `endValue` | `start-value`, `end-value` | Double-mode endpoints. Omit either to use the corresponding bound. |
| `startLabel`, `endLabel` | `start-label`, `end-label` | Accessible thumb names. By default Cube adds “Minimum” and “Maximum” to the control's label. |
| `rangeValue` | — | Read-only normalized `[start, end]` pair. Cube clamps values to the bounds, snaps to the step grid, and orders the pair. |

Set both endpoints with `setRangeValue([start, end])`. In double mode,
`beforechange` (cancelable) and `change` carry the endpoint pair in
`detail.value` and `detail.previousValue`. A thumb or track interaction
also includes `detail.thumb` (`start` or `end`). Single-mode event values
stay numeric. Assigning properties directly does not emit change events.

With a `name`, double mode submits two form entries under that name, lower
first. Read them with `new FormData(form).getAll(name)`. Reset restores the
initial endpoints; a disabled slider is not submitted.

Double-mode CSS parts: `range-track`, `range-rail`, `range-fill`,
`start-thumb`, and `end-thumb`.

[Open the double range in the Playground](/playground/?path=/story/form--range-slider-double)
