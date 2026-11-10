---
name: "Radio Group"
title: "Radio Group"
description: "Choose one value from a group of labeled options. The group exposes the selected `value` as a single form field."
order: 236
layout: document
---

# Radio Group

Choose one value from a group of labeled options. The group exposes the selected `value` as a single form field.

`<cb-radio-group>` · `@beforesemicolon/cube/form/radio-group`

:::component
<cb-radio-group name="layout" accessible-label="Layout" value="grid"
    options='[{"value":"grid","label":"Grid"},{"value":"list","label":"List"}]'>
</cb-radio-group>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--radio-group)

## Options

`cb-radio-group` options accept `label`, `value`, optional `description`, and
optional `disabled` values. Option descriptions render as secondary copy inside
the same clickable radio label.

## Reactive choices

Pass reactive Markup getters for `options` and `value` to update rendered choices and selection.
