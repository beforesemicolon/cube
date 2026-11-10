---
name: "Card"
title: "Card"
description: "Group related content inside a styled surface. Compose your own layout and actions in the default slot."
order: 724
layout: document
---

# Card

Group related content inside a styled surface. Compose your own layout and actions in the default slot.

`<cb-card>` · `@beforesemicolon/cube/data-display/card`

:::component
<cb-card padding="16px">
    <cb-heading variant="h3" description="Three pages in this project.">Studio</cb-heading>
    <cb-button label="Open project"></cb-button>
</cb-card>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--card)

## Content and layout

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
