---
name: '{{t.cube.categoryStyling}}'
title: '{{t.cube.categoryStyling}}'
path: /documentation/styling
layout: document
order: 29
---

# {{t.cube.categoryStyling}}

{{t.cube.studioCatalogBody}}

:::cube studio-styling
:::

| Component | Custom element | Category entry |
| --- | --- | --- |
| Color picker | `<cb-color-picker>` | `@beforesemicolon/cube/styling` |
| Color swatch | `<cb-color-swatch>` | `@beforesemicolon/cube/styling` |
| Eyedropper | `<cb-eyedropper>` | `@beforesemicolon/cube/styling` |
| Gradient editor | `<cb-gradient-editor>` | `@beforesemicolon/cube/styling` |
| Gradient stops | `<cb-gradient-stops>` | `@beforesemicolon/cube/styling` |

## API

{{t.cube.studioCatalogApi}}

### Shared color swatches

Pass saved hex colors through `swatches` on color pickers and gradient editors. Storage belongs to the host application: listen for the bubbling, composed `swatchadd`, `swatchupdate`, and `swatchremove` events, persist `event.detail.swatches`, and supply the updated palette to every picker. Gradient-stop pickers forward the same events.

Set `add-swatch-label` to enable adding the current color. Set `update-swatch-label` to enable replacing a selected saved swatch after changing its color. Delete or Backspace removes a focused swatch. The corresponding `beforeswatchadd`, `beforeswatchupdate`, and `beforeswatchremove` events are cancelable. Update details include `previousValue` as well as the new `value` and complete `swatches` array.
