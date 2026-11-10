---
name: "Drawer"
title: "Drawer"
description: "Open a panel from an edge of the viewport. Set `open` to show it and provide the content in the default slot."
order: 525
layout: document
---

# Drawer

Open a panel from an edge of the viewport. Set `open` to show it and provide the content in the default slot.

`<cb-drawer>` · `@beforesemicolon/cube/overlay/drawer`

:::component
<cb-button label="Open inspector" data-cube-open="inspector"></cb-button>
<cb-drawer id="inspector" heading="Inspector" placement="end"
    dismissible="true" close-label="Close inspector">
    Selection properties
</cb-drawer>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--drawer)
