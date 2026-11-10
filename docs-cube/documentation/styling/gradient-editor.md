---
name: "Gradient Editor"
title: "Gradient Editor"
description: "Edit a CSS gradient by moving, adding, and recoloring stops. The resulting gradient is exposed through `value`."
order: 1022
layout: document
---

# Gradient Editor

Edit a CSS gradient by moving, adding, and recoloring stops. The resulting gradient is exposed through `value`.

`<cb-gradient-editor>` · `@beforesemicolon/cube/styling/gradient-editor`

:::component
<cb-gradient-editor accessible-label="Background gradient"
    value="linear-gradient(90deg, #7139cf, #e9baff)">
</cb-gradient-editor>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/styling--gradient-editor)

## Saved swatches

Gradient-stop pickers use the same [swatch options and events as Color Picker](color-picker.md#saved-swatches). Pass the saved colors through `swatches` and persist changes in the application.
