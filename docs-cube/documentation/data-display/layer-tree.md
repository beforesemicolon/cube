---
name: "Layer Tree"
title: "Layer Tree"
description: "Display a hierarchy of editable layers. Set `items` and listen for selection or per-layer actions."
order: 728
layout: document
---

# Layer Tree

Display a hierarchy of editable layers. Set `items` and listen for selection or per-layer actions.

`<cb-layer-tree>` · `@beforesemicolon/cube/data-display/layer-tree`

:::component
<cb-layer-tree accessible-label="Design layers"
    items='[{"id":"page","label":"Page","children":[{"id":"header","label":"Header"},{"id":"body","label":"Body"}]}]'>
</cb-layer-tree>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--layer-tree)

## Row actions

`cb-layer-tree` removes idle row actions from layout, letting labels and technical
descriptions use the full available width. Actions appear on row hover,
selection, or keyboard focus. Focusing a row reveals its controls before Tab
enters them; hidden controls do not remain in the keyboard tab order.
