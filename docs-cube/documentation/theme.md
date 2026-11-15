---
name: '{{t.cube.theme}}'
title: '{{t.cube.theme}}'
layout: document
order: 3
---

# {{t.cube.theme}}

{{t.cube.themeBody}}

```html
<cb-theme-provider src="/themes/cube.json" appearance="dark">
  <cb-audio-player
    src="/media/recording.mp3"
    media-title="Recording"
    play-label="Play"
    pause-label="Pause"
    stop-label="Stop"
    seek-label="Seek"
    volume-label="Volume"
  ></cb-audio-player>
</cb-theme-provider>
```

[Theme Provider](theme/theme-provider.md)

## Form field spacing

Text, number, select, textarea, rich text, unit, combobox, token, masked, and
linked-value fields share `--component-field-padding-inline` (14px) and
`--component-field-padding-block` (6px). A single-row field grows to fit its
text and padding while respecting its size's minimum control height.
Textarea and rich-text box modes retain their configured row count.

```css
cb-theme-provider {
  --component-field-padding-inline: 18px;
  --component-field-padding-block: 8px;
}
```

## Layers

Theme `zIndex` tokens become scoped CSS variables. The default order is root `0`,
popup `100`, overlay `200`, flashbar `250`, modal `300`, tooltip `400`, and top
`10000`. Override `--z-index-popup` for both dropdowns and popovers, or override
their individual `--z-index-dropdown` / `--z-index-popover` aliases. Native dialog
and popover top-layer ordering cannot be changed with z-index alone. Flashbars stay
behind open modals; modal-local errors belong in inline alerts. Popup placement
inside dialogs continues to use the native top layer rather than competing with
arbitrary document z-index values.
