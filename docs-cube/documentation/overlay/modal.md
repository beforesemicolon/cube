---
name: "Modal"
title: "Modal"
description: "Open a dialog for a task that needs focused attention. Call `show()` from the action that opens it."
order: 528
layout: document
---

# Modal

Open a dialog for a task that needs focused attention. Call `show()` from the action that opens it.

`<cb-modal>` · `@beforesemicolon/cube/overlay/modal`

:::component
<cb-button label="Open project settings" data-cube-open="settings"></cb-button>
<cb-modal id="settings" heading="Project settings" dismissible="true" close-label="Close">
    <cb-field label="Project name"><cb-text-input value="Studio"></cb-text-input></cb-field>
</cb-modal>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--modal)
