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
