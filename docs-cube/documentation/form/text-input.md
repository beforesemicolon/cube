---
name: "Text Input"
title: "Text Input"
description: "Collect a single line of text. Set native-like constraints such as `type`, `required`, and `autocomplete` as needed."
order: 244
layout: document
---

# Text Input

Collect a single line of text. Set native-like constraints such as `type`, `required`, and `autocomplete` as needed.

`<cb-text-input>` · `@beforesemicolon/cube/form/text-input`

:::component
<cb-field label="Email">
    <cb-text-input type="email" name="email" placeholder="name@example.com" required></cb-text-input>
</cb-field>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--text-input)

## Native constraints

`cb-text-input` forwards `type`, `autocomplete`, `pattern`, native range and
length constraints, and `input-mode` to its native input while retaining the
component's form-associated value and change contract. `icon` adds a Cube glyph
as a decorative leading affix; keep the field label or `accessible-label` as the
control's accessible name.
