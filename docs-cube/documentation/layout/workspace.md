---
name: "Workspace"
title: "Workspace"
description: "Compose an editor shell with a main area and named `header`, `start`, `end`, and `bottom` slots."
order: 332
layout: document
---

# Workspace

Compose an editor shell with a main area and named `header`, `start`, `end`, and `bottom` slots.

`<cb-workspace>` · `@beforesemicolon/cube/layout/workspace`

:::component
<cb-workspace start-open="true" start-label="Layers">
    <span slot="header">Project workspace</span>
    <span slot="start">Home page</span>
    <cb-box padding="16px">Design canvas</cb-box>
</cb-workspace>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/layout--workspace)

## Regions and resizing

{{t.cube.workspaceBody}}
