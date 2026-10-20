import componentStylesheet from '../view.css?inline'
import { type Template } from '../../core/runtime.js'
import { mediaView } from '../view.js'
import type { PlaybackState } from '../controller.js';
import { VideoPlayerBase } from './VideoPlayerBase.js';
export class VideoPlayer extends VideoPlayerBase {
    stylesheet = componentStylesheet

    private view?: ReturnType<typeof mediaView>;
    render(): Template { this.view = mediaView(this, 'video'); return this.view.root; }
    protected mediaElement() { return this.view?.media; }
    protected playbackChanged(state: PlaybackState): void { this.view?.update(state); }
}
export { VideoPlayerBase };
