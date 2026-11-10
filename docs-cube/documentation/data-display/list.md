---
name: "List"
title: "List"
description: "Display a scrollable collection with a configurable gap and direction. Provide slotted items, or use `items` and `renderItem` for dynamic data."
order: 729
layout: document
---

# List

Display a scrollable collection with a configurable gap and direction. Provide slotted items, or use `items` and `renderItem` for dynamic data.

`<cb-list>` · `@beforesemicolon/cube/data-display/list`

:::component
<cb-list style="max-height: 8rem" gap="8px">
    <cb-card padding="8px">Home page</cb-card>
    <cb-card padding="8px">Pricing page</cb-card>
    <cb-card padding="8px">Support page</cb-card>
    <cb-card padding="8px">Archived pages</cb-card>
</cb-list>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--list)

## Rendering and infinite scrolling

`cb-list` is an unstyled scroll box. It adds no border, background, padding,
selection, empty message, or item controls. Give the host a height (vertical)
or width (horizontal) to constrain scrolling; style the content yourself.

| Property      | Default      | Behavior                                                           |
| ------------- | ------------ | ------------------------------------------------------------------ |
| `gap`         | `0`          | CSS length, or a number in pixels, between items.                  |
| `orientation` | `'vertical'` | `'vertical'` or `'horizontal'`.                                    |
| `offset`      | `100`        | Pixels remaining before requesting more items.                     |
| `items`       | `[]`         | Array, Set, Map, or another iterable.                              |
| `renderItem`  | `null`       | JavaScript callback returning an Element or Markup `HtmlTemplate`. |

`renderItem(item, indexOrKey)` receives the numeric index for arrays, Sets and
other iterables; Maps pass their value as `item` and their actual key as the
second argument. It is a JavaScript property, not a string HTML attribute.
Assign a new collection to update the list; do not mutate an existing array,
Set or Map in place. One-shot iterators are snapshotted once per assignment.
The default slot can also contain arbitrary consumer-owned content.

```ts
import type {
    List,
    ListLoadMoreDetail,
} from '@beforesemicolon/cube/data-display'
import { html } from '@beforesemicolon/web-component'

// Register the category at app level before creating the element.
const list = document.createElement('cb-list') as List<string>
list.style.height = '240px'
list.gap = 8
list.offset = 80
list.renderItem = (item, index) =>
    html`<p style="margin:0">${index}: ${item}</p>`
let items = ['First', 'Second']
list.items = items
let loading = false
let hasMore = true
list.addEventListener('loadmoreitems', async (event: Event) => {
    const { remaining } = (event as CustomEvent<ListLoadMoreDetail>).detail
    if (loading || !hasMore) return
    loading = true
    try {
        const next = await loadNextPage() // Application-owned fetch.
        hasMore = next.length > 0
        items = [...items, ...next]
        list.items = items
    } finally {
        loading = false
    }
})
list.addEventListener('scroll', (event) => {
    // Native host scroll event: list.scrollTop / list.scrollLeft are available.
})
document.body.append(list)
```

`loadmoreitems` bubbles and crosses shadow boundaries. Its detail contains
`orientation`, `itemCount`, `scrollOffset`, `scrollSize`, `viewportSize` and
`remaining` (pixel measurements). It fires once when entering the threshold,
including when the initial content does not fill the viewport. It rearms when
the user leaves the threshold, a new `items` collection is assigned, or the
orientation changes. Appending short batches can request another batch until
the viewport is filled. The app owns fetching, loading guards, errors and the
end-of-data condition. `scroll` is the native, non-bubbling host event.

The `items` and `item` parts expose structural containers only. There is no
virtualization: every supplied item is rendered.
