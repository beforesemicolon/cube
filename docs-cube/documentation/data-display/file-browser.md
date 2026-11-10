---
name: "File Browser"
title: "File Browser"
description: "Browse file and folder records in a grid or table. Give each entry a stable ID and use `parentId` to nest records."
order: 727
layout: document
---

# File Browser

Browse file and folder records in a grid or table. Give each entry a stable ID and use `parentId` to nest records.

`<cb-file-browser>` · `@beforesemicolon/cube/data-display/file-browser`

:::component
<cb-file-browser label="Project assets"
    entries='[{"id":"images","name":"Images","type":"folder"},{"id":"cover","name":"cover.svg","type":"file","mime":"image/svg+xml"}]'>
</cb-file-browser>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--file-browser)
