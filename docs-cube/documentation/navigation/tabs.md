---
name: "Tabs"
title: "Tabs"
description: "Navigate between peer views. Bind the selected `value` to the active panel in your application."
order: 426
layout: document
---

# Tabs

Navigate between peer views. Bind the selected `value` to the active panel in your application.

`<cb-tabs>` · `@beforesemicolon/cube/navigation/tabs`

:::component
<cb-tabs label="Workspace" value="design"
    items='[{"id":"design","label":"Design"},{"id":"preview","label":"Preview"}]'>
</cb-tabs>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/navigation--tabs)

## Icons and descriptions

Each item accepts `icon` (or `iconSrc`) and `description`. The icon appears
beside the label, with its description underneath. Add `stacked` for vertical tabs.
Panel content uses a slot matching the item ID.

:::component
<cb-tabs accessible-label="Account settings" value="notifications"
    items='[{"id":"notifications","label":"Notifications","description":"In-app, email and SMS alerts","icon":"bell"},{"id":"danger","label":"Danger Zone","description":"Irreversible actions","icon":"shieldCheck"}]'>
    <p slot="notifications">Choose which notifications you receive.</p>
    <p slot="danger">Manage account removal and other irreversible actions.</p>
</cb-tabs>
:::

[Try the example in the Playground](/playground/?path=/story/examples--settings-tabs)

## Width and spacing

Tabs size to their label and description, which stay on one line. Each tab has
30px trailing padding, adjustable with `--component-tabs-padding-inline-end`.
Set `fill` to share the available width between tabs. When the content exceeds
the available space, the tab strip scrolls instead of wrapping descriptions.

```html
<cb-tabs fill items='[{"id":"inbox","label":"Inbox","description":"Recent messages"},{"id":"drafts","label":"Drafts","description":"Unsent messages"}]'></cb-tabs>
```

[Try tabs filling the available width](/playground/?path=/story/examples--filled-settings-tabs)
