---
name: "Context Menu"
title: "Context Menu"
description: "Display commands at a pointer location. Applications can call `showAt(x, y)` to open the menu."
order: 524
layout: document
---

# Context Menu

Display commands at a pointer location. Applications can call `showAt(x, y)` to open the menu.

`<cb-context-menu>` · `@beforesemicolon/cube/overlay/context-menu`

:::component
<cb-button label="Show layer actions" data-cube-open="layer-menu"></cb-button>
<cb-context-menu id="layer-menu" label="Layer actions"
    items='[{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"}]'>
</cb-context-menu>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--context-menu)
