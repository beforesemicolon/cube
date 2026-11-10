---
name: "Command Palette"
title: "Command Palette"
description: "Filter and run commands from a keyboard-friendly dialog. Call `show()` or set `open` from an application shortcut or button."
order: 523
layout: document
---

# Command Palette

Filter and run commands from a keyboard-friendly dialog. Call `show()` or set `open` from an application shortcut or button.

`<cb-command-palette>` · `@beforesemicolon/cube/overlay/command-palette`

:::component
<cb-button label="Open commands" data-cube-open="commands"></cb-button>
<cb-command-palette id="commands" accessible-label="Project commands"
    placeholder="Type a command"
    items='[{"id":"save","label":"Save project"},{"id":"preview","label":"Open preview"}]'>
</cb-command-palette>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/overlay--command-palette)
