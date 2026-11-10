---
name: "Tree"
title: "Tree"
description: "Display hierarchical items. Give each node an ID and provide child nodes through `children`."
order: 731
layout: document
---

# Tree

Display hierarchical items. Give each node an ID and provide child nodes through `children`.

`<cb-tree>` · `@beforesemicolon/cube/data-display/tree`

:::component
<cb-tree accessible-label="Project folders"
    items='[{"id":"pages","label":"Pages","children":[{"id":"home","label":"Home"},{"id":"about","label":"About"}]}]'>
</cb-tree>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--tree)
