---
name: "Link"
title: "Link"
description: "Navigate using inline links that inherit surrounding typography."
order: 422
layout: document
---

# Link

Navigate to a URL using an inline native anchor. Set `href` and provide a descriptive label or slotted content.

Links inherit the surrounding font family, weight, style, line height, and
letter spacing, and wrap naturally inside paragraphs. `size` scales text
relative to the surrounding font size; the default `sm` uses the same size.
`variant` controls color and decoration. `--component-link-font-size` remains
available for an explicit font-size override.

`<cb-link>` · `@beforesemicolon/cube/navigation/link`

:::component
<cb-link href="/documentation/" label="Read the documentation"></cb-link>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/navigation--link)
