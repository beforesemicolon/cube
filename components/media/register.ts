import { register } from '../core/Component.js'
import { AudioPlayer } from './audio-player/index.js'
import { VideoPlayer } from './video-player/index.js'
export * from './audio-player/index.js'
export * from './video-player/index.js'

export function registerMedia(): void {
    register('cb-audio-player', AudioPlayer)
    register('cb-video-player', VideoPlayer)
}
