---
name: "Property Group"
title: "Property Group"
description: "Group related inspector fields. Use `collapsible` to let users fold away the group."
order: 1126
layout: document
---

# Property Group

Group related inspector fields. Use `collapsible` to let users fold away the group.

`<cb-property-group>` · `@beforesemicolon/cube/editor/property-group`

:::component
<cb-property-group label="Layout" expanded="true" collapsible="true"
    expand-label="Expand layout" collapse-label="Collapse layout">
    <cb-field label="Width"><cb-unit-input value="320" unit="px"></cb-unit-input></cb-field>
</cb-property-group>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/editor--property-group)
