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

| Component    | Custom element      | Category entry                 |
| ------------ | ------------------- | ------------------------------ |
| Button       | `<cb-button>`       | `@beforesemicolon/cube/action` |
| Split button | `<cb-split-button>` | `@beforesemicolon/cube/action` |
| Button group | `<cb-button-group>` | `@beforesemicolon/cube/action` |

Set a button's optional `pressed` property when the action represents a persistent on/off state. The same `<cb-button>` then exposes `aria-pressed`, toggles on click or keyboard activation, and emits `change`. Leave `pressed` undefined for a normal action button that emits `action`.

Set `indicator` to show a small theme-colored status dot on `<cb-button>`, and provide `indicator-label` to describe that status to assistive technology (default: “Modified”). The dot is available through `::part(indicator)`. Selection-overlay action items also accept `indicator` and `indicatorLabel`, so applications can expose edited state without custom button styling.

## API

`<cb-button size="tiny" icon="close" icon-only accessible-label="Remove item"></cb-button>` provides a compact contextual action with 1px padding and 10px icons. Its default height is 14px; ordinary variants, keyboard focus, disabled and pressed states remain available.

Use `icon-only-at="sm|md|lg"` to visually collapse the label at a viewport breakpoint while preserving its accessible name. Use `wrap` when a long visible label may span lines; the button keeps its minimum control height while allowing the content to grow. Loading keeps the accessible name and the button's layout footprint stable while centering the progress spinner.

{{t.cube.studioCatalogApi}}
