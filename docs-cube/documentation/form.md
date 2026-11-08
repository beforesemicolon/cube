---
name: '{{t.cube.categoryForm}}'
title: '{{t.cube.categoryForm}}'
path: /documentation/form
layout: document
order: 22
---

# {{t.cube.categoryForm}}

{{t.cube.studioCatalogBody}}

{{t.cube.formNative}}

{{t.cube.popupConstraintsBody}}

:::cube studio-form
:::

| Component        | Custom element          | Category entry               |
| ---------------- | ----------------------- | ---------------------------- |
| Text input       | `<cb-text-input>`       | `@beforesemicolon/cube/form` |
| Textarea         | `<cb-textarea>`         | `@beforesemicolon/cube/form` |
| Number input     | `<cb-number-input>`     | `@beforesemicolon/cube/form` |
| Unit input       | `<cb-unit-input>`       | `@beforesemicolon/cube/form` |
| CSS value input  | `<cb-css-value-input>`  | `@beforesemicolon/cube/form` |
| Combobox         | `<cb-combobox>`         | `@beforesemicolon/cube/form` |
| Checkbox         | `<cb-checkbox>`         | `@beforesemicolon/cube/form` |
| Radio            | `<cb-radio>`            | `@beforesemicolon/cube/form` |
| Radio group      | `<cb-radio-group>`      | `@beforesemicolon/cube/form` |
| Switch           | `<cb-switch>`           | `@beforesemicolon/cube/form` |
| Range slider     | `<cb-range-slider>`     | `@beforesemicolon/cube/form` |
| Stepper          | `<cb-stepper>`          | `@beforesemicolon/cube/form` |
| Date picker      | `<cb-date-picker>`      | `@beforesemicolon/cube/form` |
| Time picker      | `<cb-time-picker>`      | `@beforesemicolon/cube/form` |
| File picker      | `<cb-file-picker>`      | `@beforesemicolon/cube/form` |
| Token input      | `<cb-token-input>`      | `@beforesemicolon/cube/form` |
| Editable label   | `<cb-editable-label>`   | `@beforesemicolon/cube/form` |
| Masked input     | `<cb-masked-input>`     | `@beforesemicolon/cube/form` |
| Select           | `<cb-select>`           | `@beforesemicolon/cube/form` |
| Slider           | `<cb-slider>`           | `@beforesemicolon/cube/form` |
| Calendar         | `<cb-calendar>`         | `@beforesemicolon/cube/form` |
| Field            | `<cb-field>`            | `@beforesemicolon/cube/form` |
| Editable list    | `<cb-editable-list>`    | `@beforesemicolon/cube/form` |
| Code editor      | `<cb-code-editor>`      | `@beforesemicolon/cube/form` |
| JSON editor      | `<cb-json-editor>`      | `@beforesemicolon/cube/form` |
| Rich text editor | `<cb-rich-text-editor>` | `@beforesemicolon/cube/form` |
| Linked values    | `<cb-linked-values>`    | `@beforesemicolon/cube/form` |

`cb-checkbox` supports reactive `checked` and `indeterminate` states. Its
`label` is the primary choice text, while `description` renders secondary copy
inside the same clickable label.

`cb-radio` is the standalone form-associated radio primitive. Radios with the
same non-empty `name`, form owner, and root keep a single checked value. Use
`accessible-label` when surrounding content already supplies the visible label.

`cb-radio-group` options accept `label`, `value`, optional `description`, and
optional `disabled` values. Option descriptions render as secondary copy inside
the same clickable radio label.

`cb-text-input` forwards `type`, `autocomplete`, `pattern`, native range and
length constraints, and `input-mode` to its native input while retaining the
component's form-associated value and change contract. `icon` adds a Cube glyph
as a decorative leading affix; keep the field label or `accessible-label` as the
control's accessible name.

`cb-textarea` supports `rows`, `max-rows`, length constraints, and
`autocomplete`. `max-rows` limits the visible resize height without truncating
the value.

`cb-editable-list` supports both self-managed form collections and
caller-controlled workflows. Set `controlled` and bind `draft-value`; the list
then emits `input` with `{ value }`, `add` with `{ value, id }`, and `remove`
with `{ id }` without mutating caller-owned items. `adding`, `loading`, item
`removing`, `rows`/`chips` variants, and the `entry`, `entry-extra`,
`suggestions`, `item-content-<id>`, and `item-actions-<id>` slots cover async
and rich collection composition.

{{t.cube.unitInputBody}}

{{t.cube.selectBody}}

`cb-select` and `cb-radio-group` accept reactive Markup getters for `options`
and `value`; changing either source updates their rendered choices and selection.

`cb-combobox` accepts `multi` and an array `value` for multiple selection. Options become removable chips, the dropdown stays open after selection, and typing filters options without altering the selected values. Supply `remove-label="Remove {label}"` (translated by the application) for the × actions. Commas are ordinary characters, not selection separators. Each add/remove emits `change` with both `value` and `previousValue`; forms receive repeated entries under `name`.

When filtering leaves one enabled option, it is highlighted and Enter or Space accepts it while the input retains focus. Set `allow-custom` (`allowCustom` in JavaScript) to accept unmatched text with Enter. It defaults to false; custom values are trimmed, deduplicated, and submitted like other selections without modifying `options`. Space remains ordinary text when no lone option is highlighted.

Set `searchable` for remote or caller-managed suggestions. Typing then emits
`search` with `{ query, originalEvent }` without changing the committed value;
selection still emits the normal `change` event. `loading` and `loading-label`
represent pending results. Options may include `description`, `badge`, `icon`,
and `selectedLabel`; the latter supplies concise multi-select chip copy while
the full option remains available in the popup.

{{t.cube.formCompositionBody}}

## API

### Select and combobox trigger appearance

`cb-select` accepts the button `variant` values (`primary`, `secondary`,
`outline`, `ghost`, `destructive`, and `link`) for its custom trigger.
`cb-combobox` supports `secondary`, `outline`, and `ghost` field variants.
Both keep their existing `secondary` appearance by default.

Use `caret-position="start|end"` to move just the caret (default `end`). It
does not change text direction, option order, popup alignment, or keyboard
navigation. Native select mode retains the browser's native control.

{{t.cube.studioCatalogApi}}
