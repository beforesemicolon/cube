---
name: "Guide Overlay"
title: "Guide Overlay"
description: "Draw guide lines over a positioned canvas. Supply each line\u2019s axis, position, extent, and optional label."
order: 1124
layout: document
---

# Guide Overlay

Draw guide lines over a positioned canvas. Supply each line’s axis, position, extent, and optional label.

`<cb-guide-overlay>` · `@beforesemicolon/cube/editor/guide-overlay`

:::component
<div style="position: relative; height: 140px">
    <cb-guide-overlay
        guides='[{"id":"top","axis":"x","position":36,"start":16,"end":180,"label":"36 px","type":"measurement"},{"id":"left","axis":"y","position":64,"start":12,"end":124,"type":"snap"}]'>
    </cb-guide-overlay>
</div>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/editor--guide-overlay)
