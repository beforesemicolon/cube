---
name: "Modal Renderer"
title: "Modal Renderer"
description: "Mount a stable host for dialogs opened through Cube’s modal service."
order: 529
layout: document
---

# Modal Renderer

Mount a stable host for dialogs opened through Cube’s modal service. Place it inside the theme scope that the dialogs should inherit.

`<cb-modal-renderer>` · `@beforesemicolon/cube/overlay/modal`

:::component
<cb-button label="Open hosted modal" data-cube-open="hosted-modal"></cb-button>
<cb-modal-renderer>
    <cb-modal id="hosted-modal" heading="Hosted modal" dismissible="true" close-label="Close">
        This dialog is mounted inside the modal renderer.
    </cb-modal>
</cb-modal-renderer>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--modal-renderer)

## Modal service

{{t.cube.modalServiceBody}}

Pass the renderer to `configureModalHost` before opening dialogs through the service. Cube creates a renderer lazily when the application supplies none.

```js
import { configureModalHost, showModal } from '@beforesemicolon/cube/overlay'

const renderer = document.querySelector('cb-modal-renderer')
if (renderer) {
    configureModalHost({ renderer })
    void showModal({ heading: 'Hosted modal', closeLabel: 'Close' })
}
```

`ModalRequest.closeLabel` sets the close control's accessible label. Action
`disabled` and `loading` values accept a
boolean or a Markup-compatible getter and remain reactive for the modal lifetime.
