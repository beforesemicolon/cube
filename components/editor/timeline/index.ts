import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { actionLabel, createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import { bool, finite } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { TimelineBase, type TimelineKeyframe, type TimelineTrack } from './TimelineBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=root]{display:grid;overflow:hidden;border:1px solid ${v('--color-separator')};border-radius:var(--radius-lg,12px);background:${v('--color-surface')}}
[part~=toolbar]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding:var(--spacing-sm,8px);border-block-end:1px solid ${v('--color-separator')};background:${v('--color-surface-raised')}}
[part~=time]{margin-inline-start:auto;min-inline-size:88px;text-align:end;color:${v('--color-muted-foreground')};font:var(--component-code-font,11px/1.4 ui-monospace,monospace);font-variant-numeric:tabular-nums}
[part~=editor]{position:relative;overflow:auto;min-block-size:var(--component-timeline-height,280px)}
[part~=ruler-row],[part~=track]{display:grid;grid-template-columns:var(--component-timeline-label-width,112px) minmax(420px,1fr)}
[part~=ruler-label],[part~=track-label]{position:sticky;z-index:4;inset-inline-start:0;padding:var(--spacing-sm,8px);border-inline-end:1px solid ${v('--color-separator')};background:${v('--color-surface-raised')}}
[part~=ruler]{position:relative;block-size:34px;border-block-end:1px solid ${v('--color-separator')};background:${v('--color-surface-muted')};cursor:pointer}
[part~=tick]{position:absolute;inset-block-end:0;block-size:8px;border-inline-start:1px solid ${v('--color-border')}}
[part~=tick-label]{position:absolute;inset-block-start:4px;translate:-50% 0;color:${v('--color-muted-foreground')};font:var(--component-code-font,9px/1 ui-monospace,monospace);font-variant-numeric:tabular-nums}
[part~=track]{min-block-size:48px;border-block-end:1px solid ${v('--color-separator')}}
[part~=track-label]{display:flex;align-items:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${v('--color-muted-foreground')}}
[part~=lane]{position:relative;background:linear-gradient(90deg,color-mix(in srgb,${v('--color-separator')} 62%,transparent) 1px,transparent 1px);background-size:calc(100% / var(--cb-duration)) 100%;cursor:crosshair}
[part~=lane]::before{content:'';position:absolute;inset-inline:0;inset-block-start:50%;block-size:1px;background:${v('--color-separator')}}
[part~=keyframe]{position:absolute;z-index:2;inset-block-start:50%;inset-inline-start:var(--cb-keyframe-position);inline-size:14px;min-inline-size:14px;block-size:14px;min-block-size:14px;--component-control-height-sm:14px;translate:-50% -50%;rotate:45deg;cursor:ew-resize}
[part~=keyframe]::part(control){inline-size:14px;min-inline-size:14px;block-size:14px;min-block-size:14px;padding:0;border:2px solid ${v('--color-primary')};border-radius:2px;background:${v('--color-surface-raised')}}
[part~=keyframe][data-selected]::part(control){background:${v('--color-primary')};box-shadow:0 0 0 2px color-mix(in srgb,${v('--color-focus')} 42%,transparent)}
[part~=playhead]{position:absolute;z-index:3;inset-block-start:0;inset-block-end:0;inset-inline-start:calc(var(--component-timeline-label-width,112px) + (100% - var(--component-timeline-label-width,112px)) * var(--cb-playhead));inline-size:1px;background:${v('--color-danger')};pointer-events:none}
[part~=playhead]::before{content:'';position:absolute;inset-block-start:0;inset-inline-start:50%;translate:-50% 0;border-inline:5px solid transparent;border-block-start:8px solid ${v('--color-danger')}}
:host([data-disabled]) [part~=root]{opacity:var(--component-disabled-opacity,.5)}
@container(max-width:520px){[part~=ruler-row],[part~=track]{grid-template-columns:84px minmax(360px,1fr)}[part~=playhead]{inset-inline-start:calc(84px + (100% - 84px) * var(--cb-playhead))}}
`;
interface DragState {
    readonly trackId: string;
    readonly keyframeId: string;
    readonly pointerId: number;
    readonly lane: HTMLElement;
    readonly button: Button;
}
export class Timeline extends TimelineBase {
    private rootNode?: HTMLElement;
    private editor?: HTMLElement;
    private ruler?: HTMLElement;
    private playhead?: HTMLElement;
    private timeNode?: HTMLOutputElement;
    private playButton?: Button;
    private rewindButton?: Button;
    private addButton?: Button;
    private drag?: DragState;
    private animationFrame = 0;
    private playbackStartedAt = 0;
    private playbackStartedFrom = 0;
    private renderedDuration = -1;
    private renderedTracks = '';
    render(): Template {
        this.rootNode = element('section', { attributes: { part: 'root editor' } }) as HTMLElement;
        const toolbar = element('div', { attributes: { part: 'toolbar' } }) as HTMLDivElement;
        toolbar.setAttribute('role', 'toolbar');
        this.rewindButton = createIconButton('rewind', 'reset', event => this.seek(0, event));
        this.playButton = createIconButton('play', 'play', event => this.setPlaying(!this.playing, event));
        this.addButton = createIconButton('add-keyframe', 'plus', event => this.addKeyframe(undefined, event));
        this.timeNode = element('output', { attributes: { part: 'time' } }) as HTMLOutputElement;
        toolbar.append(this.rewindButton, this.playButton, this.addButton, this.timeNode);
        this.editor = element('div', { attributes: { part: 'editor' } }) as HTMLDivElement;
        const rulerRow = element('div', { attributes: { part: 'ruler-row' } }) as HTMLDivElement;
        const rulerLabel = element('span', { attributes: { part: 'ruler-label' } }) as HTMLSpanElement;
        this.ruler = element('div', { attributes: { part: 'ruler' } }) as HTMLDivElement;
        this.ruler.tabIndex = 0;
        this.ruler.setAttribute('role', 'slider');
        this.ruler.addEventListener('pointerdown', event => this.scrub(event, true));
        this.ruler.addEventListener('pointermove', event => { if (event.buttons === 1)
            this.scrub(event, false); });
        this.ruler.addEventListener('keydown', event => this.keyScrub(event));
        rulerRow.append(rulerLabel, this.ruler);
        this.playhead = element('span', { attributes: { part: 'playhead' } }) as HTMLSpanElement;
        this.editor.append(rulerRow, this.playhead);
        this.rootNode.append(toolbar, this.editor);
        return html`<style part="styles">${css}</style>${this.rootNode}`;
    }
    protected syncView(): void {
        if (!this.rootNode || !this.editor || !this.ruler || !this.playhead || !this.timeNode || !this.playButton || !this.rewindButton || !this.addButton)
            return;
        const duration = this.timelineDuration(), time = this.timelineTime();
        if (duration !== this.renderedDuration) {
            this.renderRuler(duration);
            this.renderedDuration = duration;
        }
        const trackSignature = this.trackSignature(duration);
        if (trackSignature !== this.renderedTracks) {
            this.editor.querySelectorAll('[part~=track]').forEach(node => node.remove());
            for (const track of this.timelineTracks())
                this.editor.append(this.renderTrack(track, duration));
            this.renderedTracks = trackSignature;
        }
        this.editor.style.setProperty('--cb-playhead', String(time / duration));
        this.editor.style.setProperty('--cb-duration', String(Math.max(1, Math.ceil(duration))));
        this.timeNode.value = this.text('timeLabel').replace('{current}', this.formatTime(time)).replace('{duration}', this.formatTime(duration));
        actionLabel(this.playButton, this.playing ? this.text('pauseLabel') : this.text('playLabel'));
        this.playButton.icon = this.playing ? 'pause' : 'play';
        actionLabel(this.rewindButton, this.text('rewindLabel'));
        actionLabel(this.addButton, this.text('addKeyframeLabel'));
        this.playButton.disabled = this.unavailable;
        this.rewindButton.disabled = this.unavailable || time <= 0;
        this.addButton.disabled = this.unavailable || !this.timelineTracks().some(track => !track.disabled);
        aria(this.rootNode, 'aria-label', this.accessibleName());
        this.ruler.setAttribute('aria-label', this.text('playheadLabel'));
        this.ruler.setAttribute('aria-valuemin', '0');
        this.ruler.setAttribute('aria-valuemax', String(duration));
        this.ruler.setAttribute('aria-valuenow', String(time));
        this.ruler.setAttribute('aria-valuetext', this.formatTime(time));
        this.ruler.tabIndex = this.unavailable ? -1 : 0;
        this.ensurePlayback();
    }
    protected unmount(): void { cancelAnimationFrame(this.animationFrame); this.animationFrame = 0; }
    private renderRuler(duration: number): void {
        if (!this.ruler)
            return;
        this.ruler.replaceChildren();
        const divisions = Math.min(20, Math.max(4, Math.ceil(duration * 2)));
        for (let index = 0; index <= divisions; index += 1) {
            const percentage = index / divisions * 100;
            const time = index / divisions * duration;
            const tick = element('span', { attributes: { part: 'tick' } }) as HTMLSpanElement;
            tick.style.insetInlineStart = `${percentage}%`;
            const label = element('span', { attributes: { part: 'tick-label' }, textContent: this.formatTime(time) }) as HTMLSpanElement;
            label.style.insetInlineStart = `${percentage}%`;
            this.ruler.append(tick, label);
        }
    }
    private renderTrack(track: TimelineTrack, duration: number): HTMLElement {
        const row = element('div', { attributes: { part: 'track' } }) as HTMLDivElement;
        row.dataset.trackId = track.id;
        const label = element('span', { attributes: { part: 'track-label' }, textContent: track.label }) as HTMLSpanElement;
        const lane = element('div', { attributes: { part: 'lane' } }) as HTMLDivElement;
        lane.dataset.trackId = track.id;
        lane.addEventListener('pointerdown', event => { if (event.target === lane)
            this.seekAt(event, lane, true); });
        for (const keyframe of track.keyframes)
            lane.append(this.renderKeyframe(track, keyframe, lane, duration));
        row.append(label, lane);
        return row;
    }
    private renderKeyframe(track: TimelineTrack, keyframe: TimelineKeyframe, lane: HTMLElement, duration: number): Button {
        const button = document.createElement('cb-button') as Button;
        button.setAttribute('part', 'keyframe');
        button.setAttribute('exportparts', 'control:keyframe-control,label:keyframe-label');
        button.variant = 'ghost';
        button.iconOnly = true;
        button.style.setProperty('--cb-keyframe-position', `calc(7px + (100% - 14px) * ${this.timelineTime(keyframe.time) / duration})`);
        button.pressed = this.selectedKeyframeId === keyframe.id;
        button.toggleAttribute('data-selected', button.pressed);
        button.accessibleLabel = this.text('keyframeLabel').replace('{track}', track.label).replace('{time}', this.formatTime(keyframe.time));
        button.disabled = this.unavailable || bool(track.disabled) || bool(keyframe.disabled);
        button.addEventListener('change', event => { event.stopPropagation(); this.selectKeyframe(track.id, keyframe.id, event); });
        button.addEventListener('pointerdown', event => {
            if (button.disabled)
                return;
            event.stopPropagation();
            this.drag = { trackId: track.id, keyframeId: keyframe.id, pointerId: event.pointerId, lane, button };
            button.setPointerCapture(event.pointerId);
        });
        button.addEventListener('pointermove', event => this.moveDrag(event));
        button.addEventListener('pointerup', event => this.endDrag(event));
        button.addEventListener('pointercancel', event => this.endDrag(event));
        button.addEventListener('keydown', event => this.keyKeyframe(track.id, keyframe, event));
        return button;
    }
    private scrub(event: PointerEvent, commit: boolean): void { if (this.ruler)
        this.seekAt(event, this.ruler, commit); }
    private seekAt(event: PointerEvent, lane: HTMLElement, commit: boolean): void {
        if (this.unavailable)
            return;
        const rect = lane.getBoundingClientRect();
        this.seek((event.clientX - rect.left) / rect.width * this.timelineDuration(), event, commit);
    }
    private keyScrub(event: KeyboardEvent): void {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || this.unavailable)
            return;
        event.preventDefault();
        if (event.key === 'Home')
            this.seek(0, event);
        else if (event.key === 'End')
            this.seek(this.timelineDuration(), event);
        else
            this.seek(this.timelineTime() + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 1 : Math.max(.001, finite(this.snap, .1))), event);
    }
    private moveDrag(event: PointerEvent): void {
        if (!this.drag || event.pointerId !== this.drag.pointerId)
            return;
        const rect = this.drag.lane.getBoundingClientRect();
        this.moveKeyframe(this.drag.trackId, this.drag.keyframeId, (event.clientX - rect.left) / rect.width * this.timelineDuration(), event, false);
    }
    private endDrag(event: PointerEvent): void {
        if (!this.drag || event.pointerId !== this.drag.pointerId)
            return;
        const drag = this.drag;
        this.drag = undefined;
        const frame = this.timelineTracks().find(track => track.id === drag.trackId)?.keyframes.find(keyframe => keyframe.id === drag.keyframeId);
        if (frame)
            this.moveKeyframe(drag.trackId, drag.keyframeId, frame.time, event, true);
    }
    private keyKeyframe(trackId: string, keyframe: TimelineKeyframe, event: KeyboardEvent): void {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key))
            return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        this.moveKeyframe(trackId, keyframe.id, keyframe.time + direction * (event.shiftKey ? 1 : Math.max(.001, finite(this.snap, .1))), event, true);
    }
    private ensurePlayback(): void {
        if (!this.playing) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = 0;
            return;
        }
        if (this.animationFrame)
            return;
        this.playbackStartedAt = performance.now();
        this.playbackStartedFrom = this.timelineTime();
        const frame = (now: number): void => {
            if (!this.playing) {
                this.animationFrame = 0;
                return;
            }
            let time = this.playbackStartedFrom + (now - this.playbackStartedAt) / 1000;
            if (time >= this.timelineDuration()) {
                if (bool(this.loop)) {
                    time %= this.timelineDuration();
                    this.playbackStartedAt = now;
                    this.playbackStartedFrom = time;
                }
                else {
                    this.playing = false;
                    time = this.timelineDuration();
                    this.emit('end', { currentTime: time });
                }
            }
            this.currentTime = time;
            this.syncView();
            if (this.playing)
                this.animationFrame = requestAnimationFrame(frame);
            else
                this.animationFrame = 0;
        };
        this.animationFrame = requestAnimationFrame(frame);
    }
    private trackSignature(duration: number): string {
        return `${duration}|${this.selectedKeyframeId}|${this.timelineTracks().map(track => `${track.id}:${track.disabled ? 1 : 0}:${track.keyframes.map(frame => `${frame.id},${frame.time},${frame.disabled ? 1 : 0}`).join(';')}`).join('|')}`;
    }
    private formatTime(value: number): string { return `${Math.round(value * 100) / 100}s`; }
}
export { TimelineBase };
export type { TimelineKeyframe, TimelineProps, TimelineTrack } from './TimelineBase.js';
