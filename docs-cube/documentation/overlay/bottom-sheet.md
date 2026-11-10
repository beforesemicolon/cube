---
name: "Bottom Sheet"
title: "Bottom Sheet"
description: "Open a panel anchored to the bottom of the viewport. Use the `footer` slot for actions."
order: 522
layout: document
---

# Bottom Sheet

Open a panel anchored to the bottom of the viewport. Use the `footer` slot for actions.

`<cb-bottom-sheet>` · `@beforesemicolon/cube/overlay/bottom-sheet`

:::component
<cb-button label="Open insert menu" data-cube-open="insert"></cb-button>
<cb-bottom-sheet id="insert" heading="Insert a block"
    dismissible="true" close-label="Close insert menu">
    Choose content to add to your page.
</cb-bottom-sheet>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--bottom-sheet)
