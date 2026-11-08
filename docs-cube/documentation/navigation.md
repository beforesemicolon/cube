---
name: '{{t.cube.categoryNavigation}}'
title: '{{t.cube.categoryNavigation}}'
path: /documentation/navigation
layout: document
order: 24
---

# {{t.cube.categoryNavigation}}

{{t.cube.studioCatalogBody}}

:::cube studio-navigation
:::

| Component | Custom element | Category entry |
| --- | --- | --- |
| Segmented control | `<cb-segmented-control>` | `@beforesemicolon/cube/navigation` |
| Tabs | `<cb-tabs>` | `@beforesemicolon/cube/navigation` |
| Breadcrumb | `<cb-breadcrumb>` | `@beforesemicolon/cube/navigation` |
| Menu | `<cb-menu>` | `@beforesemicolon/cube/navigation` |
| Link | `<cb-link>` | `@beforesemicolon/cube/navigation` |
| Pagination | `<cb-pagination>` | `@beforesemicolon/cube/navigation` |

## API

`cb-segmented-control` items may opt into `closable: true`. A separate sibling
close button leaves choice activation intact; supply `close-label="Close {item}"`
for its accessible name. Closing emits cancelable `beforeclose`, then `close`
with `{id, item, items, value, values, originalEvent}`. Closing an inactive item
preserves selection; closing the active item selects the next enabled item or
the previous one. The component updates its items and selection but emits no
`change` event for a close. Multiple-selection mode removes the closed value,
retaining a nonempty enabled selection when required and available.

`cb-segmented-control` supports `icon-only` for a persistent compact mode and
`icon-only-at="sm|md|lg"` for viewport-responsive labels. Responsive labels are
visually hidden below the selected breakpoint while remaining the accessible
name; the selected `size` continues to control control geometry.

{{t.cube.studioCatalogApi}}
