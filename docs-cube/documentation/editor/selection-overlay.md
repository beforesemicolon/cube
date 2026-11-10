---
name: "Selection Overlay"
title: "Selection Overlay"
description: "Draw a selected rectangle and provide resize or move handles. Give it a positioned parent and listen for geometry changes."
order: 1128
layout: document
---

# Selection Overlay

Draw a selected rectangle and provide resize or move handles. Give it a positioned parent and listen for geometry changes.

`<cb-selection-overlay>` · `@beforesemicolon/cube/editor/selection-overlay`

:::component
<div style="position: relative; height: 140px">
    <cb-selection-overlay accessible-label="Selected layer" move-label="Move layer"
        resize-label="Resize layer" rect='{"x":24,"y":24,"width":120,"height":80}'>
    </cb-selection-overlay>
</div>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/editor--selection-overlay)

## Action toolbar

`cb-selection-overlay` accepts `actions-align="start|center|end"` to anchor its
action toolbar to the selection's left edge, midpoint, or right edge. The
default is `center`. Alignment follows the selection during pan and zoom;
existing viewport clipping and standalone boundary handling are unchanged.

Action items accept `indicator` and `indicatorLabel` to expose edited state through their buttons.
