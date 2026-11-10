---
name: "Textarea"
title: "Textarea"
description: "Collect multiline text. Use `rows` for the starting height and `max-rows` to limit automatic growth."
order: 245
layout: document
---

# Textarea

Collect multiline text. Use `rows` for the starting height and `max-rows` to limit automatic growth.

`<cb-textarea>` · `@beforesemicolon/cube/form/textarea`

:::component
<cb-textarea accessible-label="Notes" name="notes" rows="3" value="Add a release note."></cb-textarea>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--textarea)

## Rows and constraints

`cb-textarea` supports `rows`, `max-rows`, length constraints, and
`autocomplete`. `max-rows` limits the visible resize height without truncating
the value.
