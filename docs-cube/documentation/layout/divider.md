---
name: "Divider"
title: "Divider"
description: "Separate adjacent content. The line is horizontal by default; set `stacked` for a vertical divider."
order: 324
layout: document
---

# Divider

Separate adjacent content. The line is horizontal by default; set `stacked` for a vertical divider.

Thickness follows `size`: `tiny`, `xs`, and `sm` are 1px; `md` (the default)
is 2px; `lg` is 3px; and `xl` is 4px. Override any size with
`--component-divider-thickness`.

`<cb-divider>` · `@beforesemicolon/cube/layout/divider`

:::component
<cb-col gap="8px">
    <span>Draft pages</span>
    <cb-divider></cb-divider>
    <span>Published pages</span>
</cb-col>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/layout--divider)

## Labels and line styles

Set `label` to display text alongside the line. `label-position` accepts
`start` (default), `center`, or `end`. Without a label, the line spans the divider.
With `stacked`, these positions run from top to bottom.

`variant` accepts `solid` (default), `dotted`, `dashed`, or `double`.
Double lines use at least 3px so both strokes and their gap remain visible.

:::component
<cb-col gap="16px">
    <cb-divider label="Section"></cb-divider>
    <cb-divider label="Section" label-position="center" variant="dotted"></cb-divider>
    <cb-divider label="Section" label-position="end" variant="dashed"></cb-divider>
    <cb-divider variant="double"></cb-divider>
</cb-col>
:::

Style the `line`, `before`, `after`, and `label` CSS parts, or set
`--component-divider-color`, `--component-divider-label-color`,
`--component-divider-label-gap`, and `--component-divider-label-font-size`.
Label text defaults to `0.875em` (14px within 16px text).

[Try label positions and line styles](/playground/?path=/story/examples--labeled-dividers)
