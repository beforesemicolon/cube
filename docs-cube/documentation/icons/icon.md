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

## Icon names

The [icon gallery](/playground/?path=/story/examples--icon-gallery) lists one
canonical kebab-case name per glyph, such as `credit-card`, `calendar-check`,
and `chat-left-dots`. Filled variants, such as `hexagon-fill`, have their own artwork.

Previous spellings and synonyms still resolve at runtime (`creditCard` →
`credit-card`, `settings` → `gear`), but are omitted from the gallery and name controls.
Exported SVGs and the sprite use the same view boxes and fill rules as `cb-icon`.
