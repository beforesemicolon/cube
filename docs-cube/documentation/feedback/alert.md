---
name: "Alert"
title: "Alert"
description: "Show a message in context. Set a tone and give the user enough detail to understand the state."
order: 621
layout: document
---

# Alert

Show a message in context. Set a tone and give the user enough detail to understand the state.

`<cb-alert>` · `@beforesemicolon/cube/feedback/alert`

:::component
<cb-alert label="Preview is private"
    value="Only people with the preview link can see this version." tone="info">
</cb-alert>
:::

For a message without a heading, set `description` and leave `label` and
`value` empty. Set `dismissible` to show a close button and use
`dismiss-label` to customize its accessible name. A listener can cancel
`beforedismiss`. When accepted, dismissal hides the alert and fires `dismiss`.
If you use separate modules or category scripts instead of the full Cube
bundle, load the Action and Icons categories for the close button.

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/feedback--alert)
