---
name: "Grid"
title: "Grid"
description: "Arrange children with CSS Grid. Pass a track expression to `columns` and set `gap` for spacing."
order: 326
layout: document
---

# Grid

Arrange children with CSS Grid. Pass a track expression to `columns` and set `gap` for spacing.

`<cb-grid>` · `@beforesemicolon/cube/layout/grid`

:::component
<cb-grid columns="repeat(2, minmax(0, 1fr))" gap="12px">
    <cb-card padding="12px">Design</cb-card>
    <cb-card padding="12px">Preview</cb-card>
</cb-grid>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/layout--grid)

## Empty state

Set `empty` on `cb-grid` when its slotted content represents an empty state. The
grid centers that content and makes it span every explicit column without
inspecting or restricting the slotted element type.
