---
name: "Checkbox"
title: "Checkbox"
description: "Toggle an independent choice. Set `indeterminate` to represent a mix of checked and unchecked child items."
order: 223
layout: document
---

# Checkbox

Toggle an independent choice. Set `indeterminate` to represent a mix of checked and unchecked child items.

`<cb-checkbox>` · `@beforesemicolon/cube/form/checkbox`

:::component
<cb-checkbox label="Include archived projects" name="includeArchived" checked="true"></cb-checkbox>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--checkbox)

## Checked and mixed states

`cb-checkbox` supports reactive `checked` and `indeterminate` states. Its
`label` is the primary choice text, while `description` renders secondary copy
inside the same clickable label.
