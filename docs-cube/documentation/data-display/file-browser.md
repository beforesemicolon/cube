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

The folder breadcrumb stays visible when the built-in toolbar is off. If
`entries` contains the folder tree, the browser uses `parentId` to build the
breadcrumb. If the app loads one folder at a time, pass `pathItems` in
root-to-current order, with `{ id, label }` for each folder. Include the root's
actual ID and set `currentFolderId` to the current folder's ID. The app receives
the same `navigate` event when a user opens a folder or selects a breadcrumb.

The selected count opens a list of selected items beside search. Remove an
item from the list to update the selection, or supply `clearSelectionLabel`
to offer a clear-all action. These actions use the normal `selectionchange`
and cancelable `beforeselectionchange` events.

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/data-display--file-browser)
