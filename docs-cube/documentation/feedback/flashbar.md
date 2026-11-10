---
name: "Flashbar"
title: "Flashbar"
description: "Queue notifications that can be updated or dismissed by ID. Use the `messages` property for an initial list."
order: 624
layout: document
---

# Flashbar

Queue notifications that can be updated or dismissed by ID. Use the `messages` property for an initial list.

`<cb-flashbar>` · `@beforesemicolon/cube/feedback/flashbar`

:::component
<cb-flashbar accessible-label="Notifications" style="position: relative; inset: auto"
    messages='[{"id":"saved","type":"success","heading":"Changes saved","message":"The project is up to date.","duration":0}]'>
</cb-flashbar>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/feedback--flashbar)

## Flashbar service

{{t.cube.flashbarServiceBody}}

Mount one `<cb-flashbar>` inside the application theme provider and pass it to
`configureFlashbarHost({ renderer })` when the application owns a stable shell.
Cube otherwise creates the renderer lazily.

Flashbars use `--z-index-flashbar` (default `250`) and intentionally remain behind
an open modal. Render modal-local errors as inline alerts, and close the modal
before showing a global flashbar for completed actions.
