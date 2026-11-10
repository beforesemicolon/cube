---
name: "Audio Player"
title: "Audio Player"
description: "Play an audio source with transport, seek, and volume controls. Provide labels for the available actions."
order: 821
layout: document
---

# Audio Player

Play an audio source with transport, seek, and volume controls. Provide labels for the available actions.

`<cb-audio-player>` · `@beforesemicolon/cube/media/audio-player`

:::component
<cb-audio-player src="/assets/cube/tone.wav" media-title="Studio audio"
    play-label="Play" pause-label="Pause" stop-label="Stop"
    seek-label="Seek" volume-label="Volume" mute-label="Mute" unmute-label="Unmute">
</cb-audio-player>
:::

[{{t.cubeReference.openPlayground}}](/playground/?path=/story/media--audio)

{{t.cube.mediaApi}}



## {{t.cube.access}}

{{t.cube.accessBody}}

{{t.cube.parts}}
