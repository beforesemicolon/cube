import { type Template, html } from '../../core/runtime.js'
import { mediaView } from '../view.js';
import type { PlaybackState } from '../controller.js';
import { AudioPlayerBase } from './AudioPlayerBase.js';
export class AudioPlayer extends AudioPlayerBase {
    private view?: ReturnType<typeof mediaView>;
    render(): Template { this.view = mediaView(this, 'audio'); return html`${this.view.root}`; }
    protected mediaElement() { return this.view?.media; }
    protected playbackChanged(state: PlaybackState): void { this.view?.update(state); }
}
export { AudioPlayerBase };
