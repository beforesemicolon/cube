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
import '@beforesemicolon/cube'

// Or import only the categories your application uses:
import { TextInput } from '@beforesemicolon/cube/form'
```

{{t.cube.runtime}}

```html
<script src="https://unpkg.com/@beforesemicolon/web-component@1.21.1/dist/client.js"></script>
<script src="https://unpkg.com/@beforesemicolon/cube@1.0.0/dist/client.js"></script>
```

```html
<script src="https://unpkg.com/@beforesemicolon/web-component@1.21.1/dist/client.js"></script>
<script src="https://unpkg.com/@beforesemicolon/cube@1.0.0/dist/action-client.js"></script>
<script src="https://unpkg.com/@beforesemicolon/cube@1.0.0/dist/form-client.js"></script>
```

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
