---
name: '{{t.cube.categoryAction}}'
title: '{{t.cube.categoryAction}}'
path: /documentation/action
layout: document
order: 20
---

# {{t.cube.categoryAction}}

{{t.cube.studioCatalogBody}}

:::cube studio-action
:::

| Component | Custom element | Category entry |
| --- | --- | --- |
| Button | `<cb-button>` | `@beforesemicolon/cube/action` |
| Split button | `<cb-split-button>` | `@beforesemicolon/cube/action` |
| Button group | `<cb-button-group>` | `@beforesemicolon/cube/action` |

Set a button's optional `pressed` property when the action represents a persistent on/off state. The same `<cb-button>` then exposes `aria-pressed`, toggles on click or keyboard activation, and emits `change`. Leave `pressed` undefined for a normal action button that emits `action`.

## API

{{t.cube.studioCatalogApi}}
