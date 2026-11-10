---
name: "Unit Input"
title: "Unit Input"
description: "Edit a number together with its unit. Set `unit` for the initial suffix and `units` for available choices."
order: 248
layout: document
---

# Unit Input

Edit a number together with its unit. Set `unit` for the initial suffix and `units` for available choices.

`<cb-unit-input>` · `@beforesemicolon/cube/form/unit-input`

:::component
<cb-unit-input accessible-label="Spacing" unit-label="Unit"
    value="12" unit="px" units='["px","rem","%"]'>
</cb-unit-input>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--unit-input)

## Units

{{t.cube.unitInputBody}}

## Popup sizing

{{t.cube.popupConstraintsBody}}
