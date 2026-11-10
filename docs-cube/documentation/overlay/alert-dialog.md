---
name: "Alert Dialog"
title: "Alert Dialog"
description: "Ask users to confirm a consequential action. Supply confirm and cancel labels and handle the corresponding events."
order: 521
layout: document
---

# Alert Dialog

Ask users to confirm a consequential action. Supply confirm and cancel labels and handle the corresponding events.

`<cb-alert-dialog>` · `@beforesemicolon/cube/overlay/alert-dialog`

:::component
<cb-button label="Archive project" data-cube-open="confirm-archive"></cb-button>
<cb-alert-dialog id="confirm-archive" heading="Archive this project?"
    description="You can restore it later." dismissible="true" show-cancel="true"
    confirm-label="Archive" cancel-label="Keep project" close-label="Close">
</cb-alert-dialog>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--alert-dialog)
