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

| Component | Custom element | Category entry |
| --- | --- | --- |
| Text input | `<cb-text-input>` | `@beforesemicolon/cube/form` |
| Textarea | `<cb-textarea>` | `@beforesemicolon/cube/form` |
| Number input | `<cb-number-input>` | `@beforesemicolon/cube/form` |
| Unit input | `<cb-unit-input>` | `@beforesemicolon/cube/form` |
| Combobox | `<cb-combobox>` | `@beforesemicolon/cube/form` |
| Checkbox | `<cb-checkbox>` | `@beforesemicolon/cube/form` |
| Radio group | `<cb-radio-group>` | `@beforesemicolon/cube/form` |
| Switch | `<cb-switch>` | `@beforesemicolon/cube/form` |
| Range slider | `<cb-range-slider>` | `@beforesemicolon/cube/form` |
| Stepper | `<cb-stepper>` | `@beforesemicolon/cube/form` |
| Date picker | `<cb-date-picker>` | `@beforesemicolon/cube/form` |
| Time picker | `<cb-time-picker>` | `@beforesemicolon/cube/form` |
| File picker | `<cb-file-picker>` | `@beforesemicolon/cube/form` |
| Token input | `<cb-token-input>` | `@beforesemicolon/cube/form` |
| Editable label | `<cb-editable-label>` | `@beforesemicolon/cube/form` |
| Masked input | `<cb-masked-input>` | `@beforesemicolon/cube/form` |
| Select | `<cb-select>` | `@beforesemicolon/cube/form` |
| Slider | `<cb-slider>` | `@beforesemicolon/cube/form` |
| Calendar | `<cb-calendar>` | `@beforesemicolon/cube/form` |
| Field | `<cb-field>` | `@beforesemicolon/cube/form` |
| Editable list | `<cb-editable-list>` | `@beforesemicolon/cube/form` |
| Code editor | `<cb-code-editor>` | `@beforesemicolon/cube/form` |
| JSON editor | `<cb-json-editor>` | `@beforesemicolon/cube/form` |
| Rich text editor | `<cb-rich-text-editor>` | `@beforesemicolon/cube/form` |
| Linked values | `<cb-linked-values>` | `@beforesemicolon/cube/form` |

{{t.cube.unitInputBody}}

{{t.cube.selectBody}}

`cb-combobox` accepts `multi` and an array `value` for multiple selection. Options become removable chips, the dropdown stays open after selection, and typing filters options without altering the selected values. Supply `remove-label="Remove {label}"` (translated by the application) for the × actions. Commas are ordinary characters, not selection separators. Each add/remove emits `change` with both `value` and `previousValue`; forms receive repeated entries under `name`.

When filtering leaves one enabled option, it is highlighted and Enter or Space accepts it while the input retains focus. Set `allow-custom` (`allowCustom` in JavaScript) to accept unmatched text with Enter. It defaults to false; custom values are trimmed, deduplicated, and submitted like other selections without modifying `options`. Space remains ordinary text when no lone option is highlighted.

{{t.cube.formCompositionBody}}

## API

{{t.cube.studioCatalogApi}}
