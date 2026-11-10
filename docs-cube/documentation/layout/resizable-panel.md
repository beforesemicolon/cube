---
name: "Resizable Panel"
title: "Resizable Panel"
description: "Let users resize a panel within its minimum and maximum limits. Set a starting size with `value`."
order: 328
layout: document
---

# Resizable Panel

Let users resize a panel within its minimum and maximum limits. Set a starting size with `value`.

`<cb-resizable-panel>` · `@beforesemicolon/cube/layout/resizable-panel`

:::component
<cb-resizable-panel label="Inspector" value="240" min="160" max="400"
    resize-label="Resize inspector">
    <cb-box padding="12px">Selection properties</cb-box>
</cb-resizable-panel>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/layout--resizable-panel)

## Resize and reset

`cb-resizable-panel` accepts numeric pixel values or CSS dimensions for `value`
and `default-value`, plus `min`, `max`, `step`, `placement`, `collapse-at`, and
`variant="plain"` for consumer-owned panel surfaces. Pointer and keyboard
resizing emit `resize` and `resizeend`; Home or a divider double-click restores
the default and emits `reset`. The cancelable `beforeresize` and `beforereset`
events allow a controlled consumer to reject a change.
