import { type Template, html } from '../../core/runtime.js'
import { mediaView } from '../view.js';
import type { PlaybackState } from '../controller.js';
import { VideoPlayerBase } from './VideoPlayerBase.js';
export class VideoPlayer extends VideoPlayerBase {
    private view?: ReturnType<typeof mediaView>;
    render(): Template { this.view = mediaView(this, 'video'); return html`${this.view.root}`; }
    protected mediaElement() { return this.view?.media; }
    protected playbackChanged(state: PlaybackState): void { this.view?.update(state); }
}
export { VideoPlayerBase };
