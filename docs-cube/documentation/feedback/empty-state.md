---
name: "Empty State"
title: "Empty State"
description: "Explain an empty view and give users a next step. Set the heading and icon, then place any actions in the default slot."
order: 623
layout: document
---

# Empty State

Explain an empty view and give users a next step. Set the heading and icon, then place any actions in the default slot.

`<cb-empty-state>` · `@beforesemicolon/cube/feedback/empty-state`

:::component
<cb-empty-state heading="Create your first page" icon="plus"
    description="Start from scratch or choose a template.">
    <cb-button label="Create page" variant="primary"></cb-button>
</cb-empty-state>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/feedback--empty-state)

## Content and category imports

One centered component handles blank, filtered, and error content. Set `icon`
and `heading`; optional `description` is rendered by the internal `cb-heading`.
The default slot is entirely consumer-owned body content and optional actions.
An empty `icon` hides the tile. It does not expose message `value`, `status`,
or `tone` props.

When loading categories individually, also register `text`, `layout`, and
`icons` (and `action` if providing buttons). The complete Cube client includes
these categories.
