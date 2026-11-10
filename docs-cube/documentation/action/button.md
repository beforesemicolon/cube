---
name: "Button"
title: "Button"
description: "Use a button for actions and form submission. Set `pressed` to make it a toggle and read the new state from the `change` event."
order: 21
layout: document
---

# Button

Use a button for actions and form submission. Set `pressed` to make it a toggle and read the new state from the `change` event.

`<cb-button>` · `@beforesemicolon/cube/action/button`

:::component
<cb-button variant="primary" icon="pin" pressed="false" label="Pin panel"></cb-button>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/action--button)

## API

Set a button's optional `pressed` property when the action represents a persistent on/off state. The same `<cb-button>` then exposes `aria-pressed`, toggles on click or keyboard activation, and emits `change`. Leave `pressed` undefined for a normal action button that emits `action`.

Set `indicator` to show a small theme-colored status dot on `<cb-button>`, and provide `indicator-label` to describe that status to assistive technology (default: “Modified”). The dot is available through `::part(indicator)`.

`<cb-button size="tiny" icon="close" icon-only accessible-label="Remove item"></cb-button>` provides a compact contextual action with 1px padding and 10px icons. Its default height is 14px; ordinary variants, keyboard focus, disabled and pressed states remain available.

Use `icon-only-at="sm|md|lg"` to visually collapse the label at a viewport breakpoint while preserving its accessible name. Use `wrap` when a long visible label may span lines; the button keeps its minimum control height while allowing the content to grow. Loading keeps the accessible name and the button's layout footprint stable while centering the progress spinner.
