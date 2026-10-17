import { register } from '../../core/Component.js'
import { mediaView } from '../view.js'
import type { PlaybackState } from '../controller.js'
import { VideoPlayerBase } from './VideoPlayerBase.js'
export class VideoPlayer extends VideoPlayerBase {
    private view?: ReturnType<typeof mediaView>
    render(): Node { this.view = mediaView(this, 'video'); return this.view.root }
    protected mediaElement() { return this.view?.media }
    protected playbackChanged(state: PlaybackState): void { this.view?.update(state) }
}
register('cb-video-player', VideoPlayer)
export { VideoPlayerBase }
