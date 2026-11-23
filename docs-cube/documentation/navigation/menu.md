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

## Layout and compact icons

Menus default to `stacked="true"` for vertical navigation. Set `stacked="false"`
for a horizontal menu; arrow-key navigation and separator direction follow the layout.
`variant="icon"` uses compact square controls and hides divider labels while
retaining accessible item names. `--component-menu-icon-control-size` can override
the square size (by default, the icon size plus 16px).

:::component
<cb-menu accessible-label="Mobile navigation" variant="icon" stacked="false"
    items='[{"id":"projects","label":"Projects","icon":"briefcase","group":"Workspace"},{"id":"calendar","label":"Calendar","icon":"calendar","group":"Workspace"},{"id":"settings","label":"Settings","icon":"gear","group":"Account"}]'>
</cb-menu>
:::

[Compact and horizontal menu examples](/playground/?path=/story/examples--menu-layouts)

## Scroll controls

Set `scroll-controls` (or the `scrollControls` property) on an inline menu
whose height or width is constrained. On overflow, buttons outside the menu
move to the next or previous clipped item. They disappear at their respective
ends and do not select items or emit `action`. Wheel, touch, and keyboard
navigation inside the menu keep working. For a horizontal menu, arrow direction
follows the reading direction.

:::component
<cb-menu accessible-label="More page actions" scroll-controls style="height: 124px"
    items='[{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"id":"move","label":"Move"},{"id":"archive","label":"Archive"},{"id":"delete","label":"Delete"}]'>
</cb-menu>
:::

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
