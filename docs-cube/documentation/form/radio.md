---
name: "Radio"
title: "Radio"
description: "Use standalone radios for one choice in a set. Radio controls with the same `name` and form owner share a selection."
order: 235
layout: document
---

# Radio

Use standalone radios for one choice in a set. Radio controls with the same `name` and form owner share a selection.

`<cb-radio>` · `@beforesemicolon/cube/form/radio`

:::component
<cb-row gap="16px">
    <cb-radio name="visibility" value="private" label="Private" checked="true"></cb-radio>
    <cb-radio name="visibility" value="public" label="Public"></cb-radio>
</cb-row>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--radio)

## Grouping and labels

`cb-radio` is the standalone form-associated radio primitive. Radios with the
same non-empty `name`, form owner, and root keep a single checked value. Use
`accessible-label` when surrounding content already supplies the visible label.
