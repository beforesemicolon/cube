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

## Layers

Theme `zIndex` tokens become scoped CSS variables. The default order is root `0`,
popup `100`, overlay `200`, flashbar `250`, modal `300`, tooltip `400`, and top
`10000`. Override `--z-index-popup` for both dropdowns and popovers, or override
their individual `--z-index-dropdown` / `--z-index-popover` aliases. Native dialog
and popover top-layer ordering cannot be changed with z-index alone. Flashbars stay
behind open modals; modal-local errors belong in inline alerts. Popup placement
inside dialogs continues to use the native top layer rather than competing with
arbitrary document z-index values.
