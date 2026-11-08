---
name: '{{t.cube.studioLayout}}'
title: '{{t.cube.studioLayout}}'
path: /documentation/layout
layout: document
order: 23
---

# {{t.cube.studioLayout}}

{{t.cube.studioCatalogBody}}

:::cube studio-layout
:::

| Component       | Custom element         | Category entry                 |
| --------------- | ---------------------- | ------------------------------ |
| Sidebar         | `<cb-sidebar>`         | `@beforesemicolon/cube/layout` |
| Resizable panel | `<cb-resizable-panel>` | `@beforesemicolon/cube/layout` |
| Docked panel    | `<cb-docked-panel>`    | `@beforesemicolon/cube/layout` |
| Panel header    | `<cb-panel-header>`    | `@beforesemicolon/cube/layout` |
| Toolbar         | `<cb-toolbar>`         | `@beforesemicolon/cube/layout` |
| Action bar      | `<cb-action-bar>`      | `@beforesemicolon/cube/layout` |
| Divider         | `<cb-divider>`         | `@beforesemicolon/cube/layout` |
| Box             | `<cb-box>`             | `@beforesemicolon/cube/layout` |
| Row             | `<cb-row>`             | `@beforesemicolon/cube/layout` |
| Col             | `<cb-col>`             | `@beforesemicolon/cube/layout` |
| Grid            | `<cb-grid>`            | `@beforesemicolon/cube/layout` |
| Workspace       | `<cb-workspace>`       | `@beforesemicolon/cube/layout` |

{{t.cube.workspaceBody}}

## API

Set `empty` on `cb-grid` when its slotted content represents an empty state. The
grid centers that content and makes it span every explicit column without
inspecting or restricting the slotted element type.

`cb-action-bar` accepts `wrap` for search-and-action compositions and
`actions-only` for standalone action groups. Its `start` slot grows first,
default or named `actions` content wraps in source order, and the `overflow`
slot remains last. Geometry and surface appearance are token-driven through the
`--component-action-bar-*` variables.

`cb-resizable-panel` accepts numeric pixel values or CSS dimensions for `value`
and `default-value`, plus `min`, `max`, `step`, `placement`, `collapse-at`, and
`variant="plain"` for consumer-owned panel surfaces. Pointer and keyboard
resizing emit `resize` and `resizeend`; Home or a divider double-click restores
the default and emits `reset`. The cancelable `beforeresize` and `beforereset`
events allow a controlled consumer to reject a change.

{{t.cube.studioCatalogApi}}
