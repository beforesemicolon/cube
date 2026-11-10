---
name: "Menu"
title: "Menu"
description: "Present a keyboard-navigable list of commands. Each item has a stable ID and can be disabled independently."
order: 423
layout: document
---

# Menu

Present a keyboard-navigable list of commands. Each item has a stable ID and can be disabled independently.

`<cb-menu>` · `@beforesemicolon/cube/navigation/menu`

:::component
<cb-menu label="Page actions"
    items='[{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"id":"archive","label":"Archive","disabled":true}]'>
</cb-menu>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/navigation--menu)
