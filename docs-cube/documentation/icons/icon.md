---
name: "Icon"
title: "Icon"
description: "Render a built-in icon by `name`, use an image URL with `src`, or slot in your own SVG. Keep decorative icons out of the accessible name."
order: 1321
layout: document
---

# Icon

Render a built-in icon by `name`, use an image URL with `src`, or slot in your own SVG. Keep decorative icons out of the accessible name.

`<cb-icon>` · `@beforesemicolon/cube/icons/icon`

:::component
<cb-button label="Save">
    <cb-icon name="save" slot="start"></cb-icon>
</cb-button>
<cb-icon name="layers" accessible-label="Layers"></cb-icon>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/icons--icon)
