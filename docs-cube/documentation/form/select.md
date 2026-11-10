---
name: "Select"
title: "Select"
description: "Choose a value from structured `options`. Use `multi` to allow multiple selections or `native` for the browser\u2019s select UI."
order: 240
layout: document
---

# Select

Choose a value from structured `options`. Use `multi` to allow multiple selections or `native` for the browser’s select UI.

`<cb-select>` · `@beforesemicolon/cube/form/select`

:::component
<cb-select accessible-label="Layout" value="grid"
    options='[{"value":"grid","label":"Grid"},{"value":"list","label":"List"}]'>
</cb-select>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--select)

## Search and trigger

{{t.cube.selectBody}}

Pass reactive Markup getters for `options` and `value` to update the rendered choices and selection. The custom trigger accepts the Cube button variants. Set `caret-position="start|end"` to move the caret. Native mode uses the browser control.

## Popup sizing

{{t.cube.popupConstraintsBody}}
