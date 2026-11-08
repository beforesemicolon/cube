---
name: '{{t.cube.categoryOverlay}}'
title: '{{t.cube.categoryOverlay}}'
path: /documentation/overlay
layout: document
order: 25
---

# {{t.cube.categoryOverlay}}

{{t.cube.studioCatalogBody}}

:::cube studio-overlay
:::

| Component       | Custom element         | Category entry                  |
| --------------- | ---------------------- | ------------------------------- |
| Popover         | `<cb-popover>`         | `@beforesemicolon/cube/overlay` |
| Drawer          | `<cb-drawer>`          | `@beforesemicolon/cube/overlay` |
| Hover card      | `<cb-hover-card>`      | `@beforesemicolon/cube/overlay` |
| Bottom sheet    | `<cb-bottom-sheet>`    | `@beforesemicolon/cube/overlay` |
| Context menu    | `<cb-context-menu>`    | `@beforesemicolon/cube/overlay` |
| Dropdown        | `<cb-dropdown>`        | `@beforesemicolon/cube/overlay` |
| Command palette | `<cb-command-palette>` | `@beforesemicolon/cube/overlay` |
| Tooltip         | `<cb-tooltip>`         | `@beforesemicolon/cube/overlay` |
| Modal           | `<cb-modal>`           | `@beforesemicolon/cube/overlay` |
| Alert dialog    | `<cb-alert-dialog>`    | `@beforesemicolon/cube/overlay` |

{{t.cube.modalServiceBody}}

Mount one `<cb-modal-renderer>` inside the application theme provider and pass it
to `configureModalHost({ renderer })` when the application owns a stable shell.
Cube otherwise creates the renderer lazily. `ModalRequest.closeLabel` sets the
close control's accessible label. Action `disabled` and `loading` values accept a
boolean or a Markup-compatible getter and remain reactive for the modal lifetime.

## Layers

Theme `zIndex` tokens become scoped CSS variables. The default order is root `0`,
popup `100`, overlay `200`, flashbar `250`, modal `300`, tooltip `400`, and top
`10000`. Override `--z-index-popup` for both dropdowns and popovers, or override
their individual `--z-index-dropdown` / `--z-index-popover` aliases. Native dialog
and popover top-layer ordering cannot be changed with z-index alone. Flashbars stay
behind open modals; modal-local errors belong in inline alerts. Popup placement
inside dialogs continues to use the native top layer rather than competing with
arbitrary document z-index values.

## API

### Dropdown caret

`cb-dropdown` accepts `caret-position="start|end"` on its default trigger,
independently of `variant` and text direction. Leave it unset for the existing
caret-free trigger. Custom slotted triggers retain their own content.

{{t.cube.studioCatalogApi}}
