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

## Labeled separators

Set `group` on items to insert a divider whenever the group changes. The divider
uses the incoming group's value as its label. Item order is preserved; an
ungrouped section gets an unlabeled divider.

An item with `separator: true` renders a `cb-divider`. Its optional `label`
appears at the start of the line. Load the Layout category alongside Navigation
when using menu separators. Separators are skipped by keyboard navigation.

:::component
<cb-menu accessible-label="Project actions"
    items='[{"id":"rename","label":"Rename"},{"id":"section","separator":true,"label":"Danger zone"},{"id":"delete","label":"Delete","tone":"danger"}]'>
</cb-menu>
:::
