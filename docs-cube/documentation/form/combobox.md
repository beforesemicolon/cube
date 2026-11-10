---
name: "Combobox"
title: "Combobox"
description: "Filter a list of choices by typing. Use `multi` for removable selections and `allow-custom` to accept unmatched entries."
order: 225
layout: document
---

# Combobox

Filter a list of choices by typing. Use `multi` for removable selections and `allow-custom` to accept unmatched entries.

`<cb-combobox>` · `@beforesemicolon/cube/form/combobox`

:::component
<cb-combobox accessible-label="Font family" placeholder="Choose a font"
    options='[{"value":"inter","label":"Inter"},{"value":"source-sans","label":"Source Sans 3"}]'>
</cb-combobox>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--combobox)

## Multiple values and search

`cb-combobox` accepts `multi` and an array `value` for multiple selection. Options become removable chips, the dropdown stays open after selection, and typing filters options without altering the selected values. Supply `remove-label="Remove {label}"` (translated by the application) for the × actions. Commas are ordinary characters, not selection separators. Each add/remove emits `change` with both `value` and `previousValue`; forms receive repeated entries under `name`.

When filtering leaves one enabled option, it is highlighted and Enter or Space accepts it while the input retains focus. Set `allow-custom` (`allowCustom` in JavaScript) to accept unmatched text with Enter. It defaults to false; custom values are trimmed, deduplicated, and submitted like other selections without modifying `options`. Space remains ordinary text when no lone option is highlighted.

Set `searchable` for remote or caller-managed suggestions. Typing then emits
`search` with `{ query, originalEvent }` without changing the committed value;
selection still emits the normal `change` event. `loading` and `loading-label`
represent pending results. Options may include `description`, `badge`, `icon`,
and `selectedLabel`; the latter supplies concise multi-select chip copy while
the full option remains available in the popup.

## Trigger appearance

The field accepts `secondary`, `outline`, and `ghost` variants. Set `caret-position="start|end"` to move the caret.

## Popup sizing

{{t.cube.popupConstraintsBody}}
