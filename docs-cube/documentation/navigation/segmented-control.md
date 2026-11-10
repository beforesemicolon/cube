---
name: "Segmented Control"
title: "Segmented Control"
description: "Switch between a small set of mutually exclusive views. Bind `value` to the active item ID."
order: 425
layout: document
---

# Segmented Control

Switch between a small set of mutually exclusive views. Bind `value` to the active item ID.

`<cb-segmented-control>` · `@beforesemicolon/cube/navigation/segmented-control`

:::component
<cb-segmented-control label="View" value="grid"
    items='[{"id":"grid","label":"Grid","icon":"grid"},{"id":"list","label":"List","icon":"list"}]'>
</cb-segmented-control>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/navigation--segmented-control)

## Closing items and responsive labels

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
