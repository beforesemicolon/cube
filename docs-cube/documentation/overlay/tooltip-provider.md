---
name: "Tooltip Provider"
title: "Tooltip Provider"
description: "Share tooltip configuration across a group of triggers. Wrap the group and give each tooltip its own content."
order: 531
layout: document
---

# Tooltip Provider

Share tooltip configuration across a group of triggers. Wrap the group and give each tooltip its own content.

`<cb-tooltip-provider>` · `@beforesemicolon/cube/overlay/tooltip-provider`

:::component
<cb-tooltip-provider>
    <cb-tooltip content="Save your changes" placement="bottom">
        <cb-button label="Save" icon="save" icon-only="true"></cb-button>
    </cb-tooltip>
</cb-tooltip-provider>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--tooltip-provider)
