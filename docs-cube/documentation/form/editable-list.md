---
name: "Editable List"
title: "Editable List"
description: "Let users add or remove labeled entries. Supply initial `items` and set `controlled` when the application owns the collection."
order: 228
layout: document
---

# Editable List

Let users add or remove labeled entries. Supply initial `items` and set `controlled` when the application owns the collection.

`<cb-editable-list>` · `@beforesemicolon/cube/form/editable-list`

:::component
<cb-editable-list accessible-label="Tags" placeholder="New tag" add-label="Add tag"
    items='[{"id":"draft","label":"Draft"}]'>
</cb-editable-list>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--editable-list)

## Controlled lists

`cb-editable-list` supports both self-managed form collections and
caller-controlled workflows. Set `controlled` and bind `draft-value`; the list
then emits `input` with `{ value }`, `add` with `{ value, id }`, and `remove`
with `{ id }` without mutating caller-owned items. `adding`, `loading`, item
`removing`, `rows`/`chips` variants, and the `entry`, `entry-extra`,
`suggestions`, `item-content-<id>`, and `item-actions-<id>` slots cover async
and rich collection composition.
