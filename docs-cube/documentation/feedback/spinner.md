---
name: "Spinner"
title: "Spinner"
description: "Indicate activity without a known completion percentage. Supply text that describes the operation."
order: 627
layout: document
---

# Spinner

Indicate activity without a known completion percentage. Supply text that describes the operation.

`<cb-spinner>` · `@beforesemicolon/cube/feedback/spinner`

:::component
<cb-spinner label="Loading" status="Loading assets…" size="md"></cb-spinner>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/feedback--spinner)

## Sizes

Spinner sizes are token-backed: `sm` is 16px, `md` is 24px, and `lg` is 40px
by default. Override `--component-spinner-size-*` and matching
`--component-spinner-stroke-*` tokens in a theme when an application needs a
different scale.
