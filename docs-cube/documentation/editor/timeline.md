---
name: "Timeline"
title: "Timeline"
description: "Edit animation tracks and keyframes. Supply a duration and track data, then listen for timeline interactions."
order: 1129
layout: document
---

# Timeline

Edit animation tracks and keyframes. Supply a duration and track data, then listen for timeline interactions.

`<cb-timeline>` · `@beforesemicolon/cube/editor/timeline`

:::component
<cb-timeline accessible-label="Animation timeline" duration="4" current-time="1.2"
    play-label="Play timeline" pause-label="Pause timeline" playhead-label="Playhead"
    tracks='[{"id":"opacity","label":"Opacity","keyframes":[{"id":"start","time":0},{"id":"end","time":4}]}]'>
</cb-timeline>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/editor--timeline)
