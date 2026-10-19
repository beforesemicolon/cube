import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  mediaView , mediaCSS } from '../view.js';
import type { PlaybackState } from '../controller.js';
import { VideoPlayerBase } from './VideoPlayerBase.js';
export class VideoPlayer extends VideoPlayerBase {
    stylesheet = componentStyles`${mediaCSS}`

    private view?: ReturnType<typeof mediaView>;
    render(): Template { this.view = mediaView(this, 'video'); return this.view.root; }
    protected mediaElement() { return this.view?.media; }
    protected playbackChanged(state: PlaybackState): void { this.view?.update(state); }
}
export { VideoPlayerBase };
