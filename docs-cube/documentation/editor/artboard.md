---
name: "Artboard"
title: "Artboard"
description: "Place a selectable surface inside a viewport. Set its name and enable resizing when users need to adjust its dimensions."
order: 1121
layout: document
---

# Artboard

Place a selectable surface inside a viewport. Set its name and enable resizing when users need to adjust its dimensions.

`<cb-artboard>` · `@beforesemicolon/cube/editor/artboard`

:::component
<cb-artboard name="Home page" accessible-label="Home page artboard"
    width="220" height="140" selectable selected resizable>
    <cb-box padding="16px">Page content</cb-box>
</cb-artboard>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/editor--artboard)
