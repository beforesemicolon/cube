---
name: "Verification Code"
title: "Verification Code"
description: "Collect a fixed-length code in individual cells. Set `length` for the number of characters and `pin` to mask cells as they lose focus."
order: 249
layout: document
---

# Verification Code

Collect a fixed-length code in individual cells. Set `length` for the number of characters and `pin` to mask cells as they lose focus.

`<cb-verification-code>` · `@beforesemicolon/cube/form/verification-code`

:::component
<cb-verification-code name="code" length="6" accessible-label="Verification code" required></cb-verification-code>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--verification-code)

## Code entry and validation

`length` defaults to 6 (1–32 characters). `mode` accepts `numeric` (default),
`alphabetic` (ASCII letters), `alphanumeric` (ASCII letters and digits), or
`mixed` (printable non-space ASCII). Values remain strings, preserving leading
zeros. Paste strips unsupported characters and fills the remaining cells.

Set `pin` to reveal only the current cell while editing. Entering the next
character masks the previous one; clicking or navigating back reveals only that
cell. Leaving the field masks every character. The native input remains a
password field throughout PIN entry.
This is visual masking, not encryption. `autocomplete` defaults to `one-time-code`;
the browser and operating system decide whether to offer a code. The single
native input supports selection, arrow keys, deletion, and paste, while the custom
element participates in form submission, required/exact-length validation, reset,
state restoration, and fieldset disabling. Each live edit emits one `change`
with `{ value, previousValue, originalEvent }`; programmatic updates and resets
do not emit changes. Wrap it in `cb-field` for a visible label or supporting text.

The focused cell has a visible caret and focus ring. A complete, correctly
formatted value has success borders; an incomplete code shows error borders
after blur or a failed form validation. Set `error-text` for server-rejected
codes. Success styling indicates format/length only, not server verification.
Empty untouched fields remain neutral, and reset clears touched validation.

Theme through `--component-verification-code-cell-size` (36px),
`--component-verification-code-font-size` (16px), and shared field tokens, or use
the `control`, `input`, `cells`, and `cell` CSS parts.
