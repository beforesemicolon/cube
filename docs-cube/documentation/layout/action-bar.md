---
name: "Action Bar"
title: "Action Bar"
description: "Place leading content in the `start` slot and trailing actions in the default slot."
order: 321
layout: document
---

# Action Bar

Place leading content in the `start` slot and trailing actions in the default slot.

`<cb-action-bar>` · `@beforesemicolon/cube/layout/action-bar`

:::component
<cb-action-bar accessible-label="Project actions">
    <span slot="start">One draft</span>
    <cb-button label="Save" variant="primary"></cb-button>
</cb-action-bar>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/layout--action-bar)

## Slots and wrapping

`cb-action-bar` accepts `wrap` for search-and-action compositions and
`actions-only` for standalone action groups. Its `start` slot grows first,
default or named `actions` content wraps in source order, and the `overflow`
slot remains last. Geometry and surface appearance are token-driven through the
`--component-action-bar-*` variables.
