---
name: "Accordion"
title: "Accordion"
description: "Organize information into expandable sections. Each item supplies a heading and its associated content."
order: 721
layout: document
---

# Accordion

Organize information into expandable sections. Each item supplies a heading and its associated content.

`<cb-accordion>` · `@beforesemicolon/cube/data-display/accordion`

:::component
<cb-accordion accessible-label="Project information"
    items='[{"id":"details","label":"Details","content":"Created today."},{"id":"access","label":"Access","content":"Visible to project members."}]'>
</cb-accordion>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--accordion)

## Responsive header actions

`cb-accordion` keeps its responsive header actions below the heading in narrow
containers by default. Set `wrap-actions="false"` (`wrapActions = false`) for
compact headers that should keep their heading, chevron, and actions on one row.
This changes layout only; expansion, keyboard navigation, and action events are
unchanged.
