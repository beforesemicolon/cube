---
name: "Badge"
title: "Badge"
description: "Mark an item with a short label. Use `tone` for a semantic color and keep the status clear in text."
order: 723
layout: document
---

# Badge

Mark an item with a short label. Use `tone` for a semantic color and keep the status clear in text.

`<cb-badge>` · `@beforesemicolon/cube/data-display/badge`

:::component
<cb-badge label="Published" tone="success"></cb-badge>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--badge)

## Content and tones

`cb-badge` accepts default slotted content or falls back to `value` and then
`label`. Use `tone="neutral|info|success|warning|danger"`; the inherited size
scale controls its compact, regular, and large geometry.
