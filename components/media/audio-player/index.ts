import { register } from '../../core/Component.js'
import { mediaView } from '../view.js'
import type { PlaybackState } from '../controller.js'
import { AudioPlayerBase } from './AudioPlayerBase.js'
export class AudioPlayer extends AudioPlayerBase {
    private view?: ReturnType<typeof mediaView>
    render(): Node { this.view = mediaView(this, 'audio'); return this.view.root }
    protected mediaElement() { return this.view?.media }
    protected playbackChanged(state: PlaybackState): void { this.view?.update(state) }
}
register('cb-audio-player', AudioPlayer)
export { AudioPlayerBase }
