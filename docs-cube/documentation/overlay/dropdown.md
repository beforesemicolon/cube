---
name: "Dropdown"
title: "Dropdown"
description: "Open a menu anchored to its trigger. Supply commands through `items` and use `searchable` for longer lists."
order: 526
layout: document
---

# Dropdown

Open a menu anchored to its trigger. Supply commands through `items` and use `searchable` for longer lists.

`<cb-dropdown>` · `@beforesemicolon/cube/overlay/dropdown`

:::component
<cb-dropdown label="Add element" icon="plus"
    items='[{"id":"text","label":"Text"},{"id":"image","label":"Image"}]'>
</cb-dropdown>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--dropdown)

## Trigger caret

`cb-dropdown` accepts `caret-position="start|end"` on its default trigger,
independently of `variant` and text direction. Leave it unset for the existing
caret-free trigger. Custom slotted triggers retain their own content.

## Popup sizing

{{t.cube.popupConstraintsBody}}
