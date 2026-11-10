---
name: "Split Button"
title: "Split Button"
description: "Pair a primary action with related commands. Set `value` for the primary action and supply menu entries through `items`."
order: 23
layout: document
---

# Split Button

Pair a primary action with related commands. Set `value` for the primary action and supply menu entries through `items`.

`<cb-split-button>` · `@beforesemicolon/cube/action/split-button`

:::component
<cb-split-button label="Create page" value="page"
    items='[{"id":"folder","label":"Create folder"},{"id":"template","label":"Use template"}]'>
</cb-split-button>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/action--split-button)
