---
name: '{{t.cube.guide}}'
title: '{{t.cube.guide}}'
path: /documentation
layout: document
order: 1
---

# {{t.cube.guide}}

{{t.cube.guideBody}}

```ts
import { loadComponent } from '@beforesemicolon/cube'
await loadComponent('audio-player')
```

{{t.cube.runtime}}

## {{t.cube.theme}}

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

## {{t.cube.access}}

{{t.cube.accessBody}}
