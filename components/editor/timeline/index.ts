import { or, isNot, is, css as componentStyles, type Template, html, repeat } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
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
    stylesheet = componentStyles`${css}`

    private get ruler(): HTMLElement | undefined { const node=this.refs.ruler?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private drag?: DragState;
    private animationFrame=0;
    private playbackStartedAt=0;
    private playbackStartedFrom=0;
    private track(id:string): TimelineTrack { return this.timelineTracks().find(track=>track.id===id) ?? {id,label:id,keyframes:[]}; }
    private keyframe(trackId:string,id:string): TimelineKeyframe { return this.track(trackId).keyframes.find(frame=>frame.id===id) ?? {id,time:0}; }
    private divisions(): number { return Math.min(20,Math.max(4,Math.ceil(this.timelineDuration()*2))); }
    render(): Template {
        return html`<section part="root editor" aria-label=${this.accessibleName}>
            <div part="toolbar" role="toolbar">
                <cb-button part="rewind" exportparts="control:rewind-control,label:rewind-label,button-label:rewind-label,icon:rewind-icon,description:rewind-description" icon-only icon="reset" variant="ghost" size="sm" accessible-label=${() => this.text('rewindLabel')} disabled=${or(() => this.unavailable, () => this.timelineTime()<=0)}
                    onaction=${(event: Event) => { event.stopPropagation(); this.seek(0,event); }}></cb-button>
                <cb-button part="play" exportparts="control:play-control,label:play-label,button-label:play-label,icon:play-icon,description:play-description" icon-only icon=${() => this.playing ? 'pause' : 'play'} variant="ghost" size="sm"
                    accessible-label=${() => this.text(this.playing ? 'pauseLabel' : 'playLabel')} disabled=${() => this.unavailable}
                    onaction=${(event: Event) => { event.stopPropagation(); this.setPlaying(!this.playing,event); }}></cb-button>
                <cb-button part="add-keyframe" exportparts="control:add-keyframe-control,label:add-keyframe-label,button-label:add-keyframe-label,icon:add-keyframe-icon,description:add-keyframe-description" icon-only icon="plus" variant="ghost" size="sm" accessible-label=${() => this.text('addKeyframeLabel')}
                    disabled=${or(() => this.unavailable, isNot(() => this.timelineTracks().some(track=>!track.disabled)))}
                    onaction=${(event: Event) => { event.stopPropagation(); this.addKeyframe(undefined,event); }}></cb-button>
                <output part="time">${() => this.text('timeLabel').replace('{current}',this.formatTime(this.timelineTime())).replace('{duration}',this.formatTime(this.timelineDuration()))}</output>
            </div><div part="editor" style=${() => `--cb-playhead:${this.timelineTime()/this.timelineDuration()};--cb-duration:${Math.max(1,Math.ceil(this.timelineDuration()))}`}>
                <div part="ruler-row"><span part="ruler-label"></span>
                    <div part="ruler" ref="ruler" role="slider" tabindex=${() => this.unavailable ? -1 : 0}
                        aria-label=${() => this.text('playheadLabel')} aria-valuemin="0" aria-valuemax=${this.timelineDuration}
                        aria-valuenow=${this.timelineTime} aria-valuetext=${() => this.formatTime(this.timelineTime())}
                        onpointerdown=${(event: PointerEvent) => this.scrub(event,true)}
                        onpointermove=${(event: PointerEvent) => { if(event.buttons===1) this.scrub(event,false); }}
                        onkeydown=${this.keyScrub}>
                        ${repeat(() => Array.from({length:this.divisions()+1},(_,index)=>index),index => html`<span part="tick" style=${() => `inset-inline-start:${index/this.divisions()*100}%`}></span>
                            <span part="tick-label" style=${() => `inset-inline-start:${index/this.divisions()*100}%`}>${() => this.formatTime(index/this.divisions()*this.timelineDuration())}</span>`)}
                    </div></div><span part="playhead"></span>
                ${repeat(() => this.timelineTracks().map(track=>track.id),trackId => html`<div part="track" data-track-id=${trackId}>
                    <span part="track-label">${() => this.track(trackId).label}</span>
                    <div part="lane" data-track-id=${trackId} onpointerdown=${(event: PointerEvent) => {
                        if(event.target === event.currentTarget && event.currentTarget instanceof HTMLElement) this.seekAt(event,event.currentTarget,true);
                    }}>
                        ${repeat(() => this.track(trackId).keyframes.map(frame=>frame.id),id => html`<cb-button part="keyframe" icon-only variant="ghost"
                            exportparts="control:keyframe-control,label:keyframe-label"
                            style=${() => `--cb-keyframe-position:calc(7px + (100% - 14px) * ${this.timelineTime(this.keyframe(trackId,id).time)/this.timelineDuration()})`}
                            pressed=${is(this.props.selectedKeyframeId, id)} data-selected=${() => this.selectedKeyframeId===id ? '' : null}
                            accessible-label=${() => this.text('keyframeLabel').replace('{track}',this.track(trackId).label).replace('{time}',this.formatTime(this.keyframe(trackId,id).time))}
                            disabled=${or(() => this.unavailable, () => bool(this.track(trackId).disabled), () => bool(this.keyframe(trackId,id).disabled))}
                            onchange=${(event: Event) => { event.stopPropagation(); this.selectKeyframe(trackId,id,event); }}
                            onpointerdown=${(event: PointerEvent) => {
                                const button=event.currentTarget as Button,lane=button.parentElement;
                                if(button.disabled || !lane) return;
                                event.stopPropagation(); this.drag={trackId,keyframeId:id,pointerId:event.pointerId,lane,button}; button.setPointerCapture(event.pointerId);
                            }}
                            onpointermove=${this.moveDrag} onpointerup=${this.endDrag}
                            onpointercancel=${this.endDrag}
                            onkeydown=${(event: KeyboardEvent) => this.keyKeyframe(trackId,this.keyframe(trackId,id),event)}></cb-button>`,{key:id=>id})}
                    </div></div>`,{key:id=>id})}
            </div></section>`;
    }
    protected syncView(): void { this.ensurePlayback(); }
    protected unmount(): void { cancelAnimationFrame(this.animationFrame); this.animationFrame=0; }
    private scrub(event: PointerEvent, commit: boolean): void { if (this.ruler)
        this.seekAt(event, this.ruler, commit); }
    private seekAt(event: PointerEvent, lane: HTMLElement, commit: boolean): void {
        if (this.unavailable)
            return;
        const rect = lane.getBoundingClientRect();
        this.seek((event.clientX - rect.left) / rect.width * this.timelineDuration(), event, commit);
    }
    private keyScrub = (event: KeyboardEvent): void => {
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
    private moveDrag = (event: PointerEvent): void => {
        if (!this.drag || event.pointerId !== this.drag.pointerId)
            return;
        const rect = this.drag.lane.getBoundingClientRect();
        this.moveKeyframe(this.drag.trackId, this.drag.keyframeId, (event.clientX - rect.left) / rect.width * this.timelineDuration(), event, false);
    }
    private endDrag = (event: PointerEvent): void => {
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
    private formatTime(value: number): string { return `${Math.round(value * 100) / 100}s`; }
}
export { TimelineBase };
export type { TimelineKeyframe, TimelineProps, TimelineTrack } from './TimelineBase.js';
