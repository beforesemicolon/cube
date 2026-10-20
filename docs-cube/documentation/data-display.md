---
name: '{{t.cube.categoryDataDisplay}}'
title: '{{t.cube.categoryDataDisplay}}'
path: /documentation/data-display
layout: document
order: 27
---

# {{t.cube.categoryDataDisplay}}

{{t.cube.studioCatalogBody}}

:::cube studio-data-display
:::

| Component | Custom element | Category entry |
| --- | --- | --- |
| Badge | `<cb-badge>` | `@beforesemicolon/cube/data-display` |
| Avatar | `<cb-avatar>` | `@beforesemicolon/cube/data-display` |
| Card | `<cb-card>` | `@beforesemicolon/cube/data-display` |
| List | `<cb-list>` | `@beforesemicolon/cube/data-display` |
| Table | `<cb-table>` | `@beforesemicolon/cube/data-display` |
| Tree | `<cb-tree>` | `@beforesemicolon/cube/data-display` |
| Accordion | `<cb-accordion>` | `@beforesemicolon/cube/data-display` |
| Expandable section | `<cb-expandable-section>` | `@beforesemicolon/cube/data-display` |
| File browser | `<cb-file-browser>` | `@beforesemicolon/cube/data-display` |
| Layer tree | `<cb-layer-tree>` | `@beforesemicolon/cube/data-display` |
| Code preview | `<cb-code-preview>` | `@beforesemicolon/cube/data-display` |

{{t.cube.dataDisplayAdvancedBody}}

## API

### List

`cb-list` is an unstyled scroll box. It adds no border, background, padding,
selection, empty message, or item controls. Give the host a height (vertical)
or width (horizontal) to constrain scrolling; style the content yourself.

| Property | Default | Behavior |
| --- | --- | --- |
| `gap` | `0` | CSS length, or a number in pixels, between items. |
| `orientation` | `'vertical'` | `'vertical'` or `'horizontal'`. |
| `offset` | `100` | Pixels remaining before requesting more items. |
| `items` | `[]` | Array, Set, Map, or another iterable. |
| `renderItem` | `null` | JavaScript callback returning an Element or Markup `HtmlTemplate`. |

`renderItem(item, indexOrKey)` receives the numeric index for arrays, Sets and
other iterables; Maps pass their value as `item` and their actual key as the
second argument. It is a JavaScript property, not a string HTML attribute.
Assign a new collection to update the list; do not mutate an existing array,
Set or Map in place. One-shot iterators are snapshotted once per assignment.
The default slot can also contain arbitrary consumer-owned content.

```ts
import type { List, ListLoadMoreDetail } from '@beforesemicolon/cube/data-display'
import { html } from '@beforesemicolon/web-component'

// Register the category at app level before creating the element.
const list = document.createElement('cb-list') as List<string>
list.style.height = '240px'
list.gap = 8
list.offset = 80
list.renderItem = (item, index) => html`<p style="margin:0">${index}: ${item}</p>`
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
    } finally { loading = false }
})
list.addEventListener('scroll', event => {
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

### Card

`cb-card` is a styled box, not a card-content layout. It inherits the Box family
surface and sizing props. Its single default slot is entirely consumer-owned:
there is no generated header, media region, metadata, footer, or action.
Compose application-specific card types with your own children.

```html
<cb-card padding="24px">
  <cb-col gap="16px">
    <cb-heading>My application card</cb-heading>
    <p>Any content or layout can go here.</p>
    <cb-button>Open</cb-button>
  </cb-col>
</cb-card>
```

{{t.cube.studioCatalogApi}}
