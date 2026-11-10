---
name: "Table"
title: "Table"
description: "Display structured rows using a column definition for each field. Mark columns as sortable to let users reorder the view."
order: 730
layout: document
---

# Table

Display structured rows using a column definition for each field. Mark columns as sortable to let users reorder the view.

`<cb-table>` · `@beforesemicolon/cube/data-display/table`

:::component
<cb-table accessible-label="Project pages"
    columns='[{"id":"name","header":"Page","field":"name","sortable":true},{"id":"status","header":"Status","field":"status"}]'
    items='[{"id":"home","name":"Home","status":"Published"},{"id":"pricing","name":"Pricing","status":"Draft"}]'>
</cb-table>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--table)

## Columns, cells, and messages

`cb-table` owns semantic table markup, sorting, selection, grouping, tree
expansion, resizing, sticky columns/header, density, loading and empty states,
keyboard row activation, and live announcements. Supply application data through
typed `items` and `columns`; keep domain mutations in the consumer.

Use the typed `messages` object for localized table labels and announcement
templates. Individual message properties remain supported and take precedence
over the object for one-off overrides.

Column `cell(context)` receives `{ item, rowIndex, column, value, depth }`. It
may return a primitive, DOM node, Cube template, or a package-neutral structural
renderer with `render(target)` and optional `unmount()`. This allows applications
using another compatible Markup package instance to provide rich cells without
casts or adapter components.

```ts
import type {
    TableCellRenderable,
    TableColumn,
    TableMessages,
} from '@beforesemicolon/cube/data-display/table'

const messages: Partial<TableMessages> = {
    emptyLabel: 'No resources',
    loadingLabel: 'Loading resources',
}

const columns: TableColumn<Resource>[] = [
    {
        id: 'name',
        header: 'Name',
        field: 'name',
        sortable: true,
        cell: ({ item }) =>
            externalTemplate(item) satisfies TableCellRenderable,
    },
]

const table = document.createElement('cb-table')
Object.assign(table, { items, columns, messages })
```
