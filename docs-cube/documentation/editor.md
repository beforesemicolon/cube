---
name: '{{t.cube.categoryEditor}}'
title: '{{t.cube.categoryEditor}}'
path: /documentation/editor
layout: document
order: 30
---

# {{t.cube.categoryEditor}}

{{t.cube.studioCatalogBody}}

:::cube studio-editor
:::

| Component | Custom element | Category entry |
| --- | --- | --- |
| Viewport | `<cb-viewport>` | `@beforesemicolon/cube/editor` |
| Artboard | `<cb-artboard>` | `@beforesemicolon/cube/editor` |
| Rulers | `<cb-rulers>` | `@beforesemicolon/cube/editor` |
| Device frame | `<cb-device-frame>` | `@beforesemicolon/cube/editor` |
| Bezier | `<cb-bezier>` | `@beforesemicolon/cube/editor` |
| Timeline | `<cb-timeline>` | `@beforesemicolon/cube/editor` |
| Property group | `<cb-property-group>` | `@beforesemicolon/cube/editor` |
| Selection overlay | `<cb-selection-overlay>` | `@beforesemicolon/cube/editor` |
| Guide overlay | `<cb-guide-overlay>` | `@beforesemicolon/cube/editor` |
| Marquee selection | `<cb-marquee-selection>` | `@beforesemicolon/cube/editor` |

{{t.cube.editorPrimitivesBody}}

`cb-viewport` supports `pan-tool="true"` for a hand-tool mode: its native input surface captures dragging across all canvas content, including embedded iframes, with `grab`/`grabbing` cursors. The default slot is unchanged and viewport zoom controls remain interactive. `pannable="false"` or `disabled` disables the hand surface. Wheel/trackpad panning remains available without enabling the hand tool. The optional `pan-surface` part is the native hand-tool input surface.

## API

{{t.cube.studioCatalogApi}}
