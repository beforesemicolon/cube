---
name: "Field"
title: "Field"
description: "Wrap a compatible form control to supply a visible label, supporting text, and validation feedback."
order: 229
layout: document
---

# Field

Wrap a compatible form control to supply a visible label, supporting text, and validation feedback.

Fields fill their available inline space by default, and compatible Cube controls fill the field. Set `--component-field-width` when an intentionally narrower field is needed.

`<cb-field>` · `@beforesemicolon/cube/form/field`

:::component
<cb-field label="Project name" description="Shown in your workspace.">
    <cb-text-input name="project" value="Studio"></cb-text-input>
</cb-field>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/form--field)
