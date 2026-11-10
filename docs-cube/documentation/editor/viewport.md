---
name: "Viewport"
title: "Viewport"
description: "Provide a pannable and zoomable canvas for editor content. Use `grid` for a visual reference and `controls` for zoom actions."
order: 1130
layout: document
---

# Viewport

Provide a pannable and zoomable canvas for editor content. Use `grid` for a visual reference and `controls` for zoom actions.

`<cb-viewport>` · `@beforesemicolon/cube/editor/viewport`

:::component
<cb-viewport accessible-label="Design canvas" grid pannable controls
    zoom-in-label="Zoom in" zoom-out-label="Zoom out" reset-label="Reset view">
    <cb-artboard name="Home page" width="220" height="140">Home page</cb-artboard>
</cb-viewport>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/editor--viewport)

## Hand tool

`cb-viewport` supports `pan-tool="true"` for a hand-tool mode: its native input surface captures dragging across all canvas content, including embedded iframes, with `grab`/`grabbing` cursors. The default slot is unchanged and viewport zoom controls remain interactive. `pannable="false"` or `disabled` disables the hand surface. Wheel/trackpad panning remains available without enabling the hand tool. The optional `pan-surface` part is the native hand-tool input surface.
