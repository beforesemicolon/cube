---
name: "Popover"
title: "Popover"
description: "Show supplementary content next to a trigger. Put the trigger in the named `trigger` slot and the panel content in the default slot."
order: 529
layout: document
---

# Popover

Show supplementary content next to a trigger. Put the trigger in the named `trigger` slot and the panel content in the default slot.

`<cb-popover>` · `@beforesemicolon/cube/overlay/popover`

:::component
<cb-popover accessible-label="Project details" placement="bottom-start">
    <cb-button slot="trigger" label="Project details"></cb-button>
    <cb-box padding="12px">Last updated today.</cb-box>
</cb-popover>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--popover)

## Popup sizing

{{t.cube.popupConstraintsBody}}
