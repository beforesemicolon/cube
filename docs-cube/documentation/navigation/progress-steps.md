---
name: "Progress steps"
title: "Progress steps"
description: "Show current, completed, and pending steps. A click reports the zero-based step index."
order: 425
layout: document
---

# Progress steps

Use a step indicator to show position in a short task and let users jump to a reachable step. Set `variant="dots"` (default) or `variant="lines"`. Cube does not change the active step by itself.

`<cb-progress-steps>` · `@beforesemicolon/cube/navigation/progress-steps`

For per-component imports, also load `@beforesemicolon/cube/action/button`. For classic scripts, load the Action client as well as the Navigation client.

:::component
<cb-progress-steps label="Onboarding progress" total-steps="5" active-index="1"
    last-reachable-index="2" step-label="Step {step}">
</cb-progress-steps>
:::

- The Lines variant uses compact pill-shaped marks. Both variants use larger, separated click targets.
- `total-steps` sets the number of dots. `active-index` is zero-based and marks the current step.
- `last-reachable-index` is optional and inclusive. Set it to `-1` to keep all dots reachable. Setting `disabled` disables every dot.
- `step-label` uses `{step}` for the one-based accessible name. Set the JavaScript `stepLabels` property to an array to name individual steps. Use `label` or `accessible-label` to name the navigation region.
- The bubbling `click` event carries `detail.index` (zero-based) and `detail.originalEvent`. Set `activeIndex` when the requested step is ready.

Use `--component-progress-steps-gap`, `--component-progress-steps-target-size`, or `--component-progress-steps-dot-size` for spacing and size. Dot targets stay at least 24 CSS pixels. For Lines, use `--component-progress-steps-line-width` and `--component-progress-steps-line-height` to size the marks. The pending border uses the theme foreground by default; use `--component-progress-steps-pending-color` to override the pending dot color. Completed and current dots use the theme primary color; override it with `--component-progress-steps-active-color`. Keep both colors readable against the background.

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/navigation--progress-steps)
