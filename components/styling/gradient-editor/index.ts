import { type Template, html, repeat } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import type { Button } from '../../action/button/index.js';
import { bool, clamp, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import type { ColorPicker } from '../color-picker/index.js';
import { GradientEditorBase } from './GradientEditorBase.js';
import type { GradientPosition, GradientStop } from './gradient.js';
const css = editorCSS + `
:host{display:block;inline-size:var(--component-gradient-editor-width,560px);max-inline-size:100%;min-inline-size:min(100%,var(--component-gradient-editor-min-width,320px));container-type:inline-size}
[part~=root]{display:grid;gap:var(--spacing-md,12px);min-inline-size:0}
[part~=track]{background-color:${v('--color-surface')};background-image:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0);background-size:12px 12px}
[part~=geometry]{display:flex;align-items:end;gap:var(--spacing-sm,8px);flex-wrap:wrap}
[part~=mode]{flex:none}
[part~=angle-field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:88px}
[part~=control-label],[part~=section-label]{color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);font-weight:600}
[part~=angle]{inline-size:88px;min-block-size:var(--cb-height);padding:4px 8px;border:1px solid ${v('--color-border')};border-radius:var(--radius-sm);background:${v('--color-surface-muted')};font-variant-numeric:tabular-nums}
[part~=angle]::-webkit-inner-spin-button{appearance:none;margin:0}
[part~=radial-controls]{display:flex;align-items:end;gap:var(--spacing-sm,8px);flex:1;flex-wrap:wrap}
[part~=select-field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:0}
[part~=shape],[part~=extent],[part~=position]{--component-select-width:var(--component-gradient-select-width,132px)}
[part~=stops]{display:grid;gap:var(--spacing-sm,8px)}
[part~=stops-header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px)}
[part~=stop-actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px)}
[part~=track]{position:relative;block-size:38px;margin:0 10px 32px;border:1px solid ${v('--color-border')};border-radius:var(--radius-md);box-shadow:inset 0 0 0 1px color-mix(in srgb,#fff 35%,transparent);cursor:crosshair;touch-action:none;user-select:none}
[part~=track-color]{position:absolute;inset:0;border-radius:calc(var(--radius-md) - 1px);background:var(--cb-track-gradient);pointer-events:none}
[part~=stop]{position:absolute;inset-block-start:100%;display:block;inline-size:22px;min-inline-size:22px;block-size:28px;min-block-size:28px;padding:8px 3px 2px;border:0;border-radius:0;background:transparent!important;transform:translate(-50%,3px);color:${v('--color-muted-foreground')};cursor:ew-resize;touch-action:none}
[part~=stop]::part(control),[part~=stop]::part(button-label){display:block;inline-size:100%;block-size:100%;overflow:visible;cursor:inherit;touch-action:inherit}
[part~=stop]::before{content:'';position:absolute;inset-block-start:0;inset-inline-start:7px;border-inline:4px solid transparent;border-block-end:7px solid currentColor}
[part~=stop-swatch]{display:block;inline-size:16px;block-size:16px;border:2px solid ${v('--color-surface-raised')};border-radius:3px;background:var(--cb-stop-color);box-shadow:0 0 0 1px currentColor}
[part~=stop][data-selected]{z-index:1;color:${v('--color-primary')}}
[part~=stop][data-selected] [part~=stop-swatch]{box-shadow:0 0 0 2px currentColor}
[part~=stop-color]{position:absolute;z-index:2;inset-block-start:calc(100% + 31px);inset-inline-start:var(--cb-selected-stop-position);inline-size:1px;min-inline-size:1px;block-size:1px;transform:translateX(-50%);--component-color-picker-trigger-size:1px}
[part~=stop-color]::part(trigger){visibility:hidden;padding:0;border:0}
[part~=hidden-control]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
:host([data-disabled]) [part~=track]{cursor:not-allowed;opacity:var(--component-disabled-opacity,.5)}
:host([data-invalid]) [part~=track]{border-color:${v('--color-danger')}}
@container(max-width:420px){[part~=geometry],[part~=radial-controls]{display:grid;grid-template-columns:1fr 1fr;inline-size:100%}[part~=mode]{grid-column:1/-1}[part~=shape],[part~=extent],[part~=position]{--component-select-width:100%}}
@media(pointer:coarse){[part~=track]{block-size:44px;margin-block-end:38px}[part~=stop]{inline-size:30px;min-inline-size:30px;block-size:34px;min-block-size:34px}[part~=stop]::before{inset-inline-start:11px}}
`;
interface DragState {
    readonly id: string;
    readonly pointerId: number;
    readonly handle: Button;
    moved: boolean;
    position: number;
}
interface ChoiceOption {
    readonly value: string;
    readonly label: string;
}
export class GradientEditor extends GradientEditorBase {
    private node(name:string): HTMLElement | undefined { const node=this.refs[name]?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get track(): HTMLElement | undefined { return this.node('track'); }
    private get angleInput(): HTMLInputElement | undefined { const node=this.node('angle'); return node instanceof HTMLInputElement ? node : undefined; }
    private get colorPicker(): ColorPicker | undefined { return this.node('picker') as ColorPicker | undefined; }
    private get formControl(): HTMLInputElement | undefined { const node=this.node('form'); return node instanceof HTMLInputElement ? node : undefined; }
    private get handles(): Map<string,Button> { return new Map((this.refs.handles ?? []).flatMap(node => node instanceof HTMLElement && node.dataset.stopId ? [[node.dataset.stopId,node as Button] as const] : [])); }
    private drag?: DragState;
    private blocked(): boolean { return this.unavailable || bool(this.readOnly); }
    private stop(id:string): GradientStop { return this.model().stops.find(stop=>stop.id === id) ?? this.selectedStop(); }
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText))); }
    render(): Template {
        return html`<style part="styles">${css}</style><div part="root"><div part="geometry">
            <cb-segmented-control part="mode" exportparts="group:mode-group,item:mode-item,item-label:mode-label"
                value=${() => this.model().type} accessible-label=${() => this.typeLabel || this.accessibleName()} disabled=${() => this.blocked()} size=${() => this.size}
                items=${() => [{id:'linear',label:this.linearLabel || 'linear'},{id:'radial',label:this.radialLabel || 'radial'}]}
                onchange=${(event: CustomEvent<{value:string}>) => { event.stopPropagation(); if(event.detail.value === 'linear' || event.detail.value === 'radial') this.changeType(event.detail.value,event); }}></cb-segmented-control>
            <label part="angle-field" hidden=${() => this.model().type !== 'linear'}><span part="control-label">${() => this.angleLabel}</span>
                <input part="angle control" ref="angle" type="number" step="1" inputmode="decimal" value=${() => this.model().angle} disabled=${() => this.blocked()}
                    aria-label=${() => this.angleLabel} oninput=${(event: Event) => this.changeAngle(this.angleInput?.valueAsNumber ?? this.angle,event,false)}></label>
            <div part="radial-controls" hidden=${() => this.model().type !== 'radial'}>
                ${this.selectField('shape',() => this.shapeLabel,() => this.model().shape,() => [
                    {value:'circle',label:this.circleLabel || 'circle'},{value:'ellipse',label:this.ellipseLabel || 'ellipse'}
                ],event => { const value=event.detail.value; if(value === 'circle' || value === 'ellipse') this.changeShape(value,event); })}
                ${this.selectField('extent',() => this.extentLabel,() => this.model().extent,() => [
                    {value:'closest-side',label:this.closestSideLabel || 'closest-side'},{value:'closest-corner',label:this.closestCornerLabel || 'closest-corner'},
                    {value:'farthest-side',label:this.farthestSideLabel || 'farthest-side'},{value:'farthest-corner',label:this.farthestCornerLabel || 'farthest-corner'}
                ],event => { const value=event.detail.value; if(value === 'closest-side' || value === 'closest-corner' || value === 'farthest-side' || value === 'farthest-corner') this.changeExtent(value,event); })}
                ${this.selectField('position',() => this.positionLabel,() => this.model().position,() => [
                    {value:'left top',label:this.topLeftLabel || 'left top'},{value:'center top',label:this.topLabel || 'center top'},
                    {value:'right top',label:this.topRightLabel || 'right top'},{value:'left center',label:this.leftLabel || 'left center'},
                    {value:'center',label:this.centerLabel || 'center'},{value:'right center',label:this.rightLabel || 'right center'},
                    {value:'left bottom',label:this.bottomLeftLabel || 'left bottom'},{value:'center bottom',label:this.bottomLabel || 'center bottom'},
                    {value:'right bottom',label:this.bottomRightLabel || 'right bottom'}
                ],event => { if(this.isPosition(event.detail.value)) this.changePosition(event.detail.value,event); })}
            </div></div><section part="stops"><div part="stops-header"><span part="section-label">${() => this.stopsLabel}</span><div part="stop-actions">
                <cb-button part="add-stop" exportparts="control:add-stop-control,label:add-stop-label,button-label:add-stop-label,icon:add-stop-icon,description:add-stop-description" icon-only icon="plus" variant="ghost" size="sm" accessible-label=${() => this.addStopLabel} disabled=${() => this.blocked()}
                    onaction=${(event: Event) => { event.stopPropagation(); this.addStop(this.largestGapPosition(),event); }}></cb-button>
                <cb-button part="remove-stop" exportparts="control:remove-stop-control,label:remove-stop-label,button-label:remove-stop-label,icon:remove-stop-icon,description:remove-stop-description" icon-only icon="close" variant="ghost" size="sm" accessible-label=${() => this.removeStopLabel}
                    disabled=${() => this.blocked() || this.model().stops.length <= 2}
                    onaction=${(event: Event) => { event.stopPropagation(); if(this.removeStop(this.selectedStopId(),event)) queueMicrotask(()=>this.handles.get(this.selectedStopId())?.focus()); }}></cb-button>
            </div></div><div part="track" ref="track" role="group" aria-label=${() => this.stopsLabel}
                onclick=${(event: MouseEvent) => {
                    if(!(event.target instanceof HTMLElement) || !event.target.matches('[part~=track],[part~=track-color]')) return;
                    const bounds=this.track?.getBoundingClientRect(); if(bounds?.width) this.addStop((event.clientX-bounds.left)/bounds.width*100,event);
                }}>
                <div part="track-color" style=${() => `--cb-track-gradient:${this.trackGradient(this.model().stops)}`}></div>
                ${repeat(() => this.model().stops.map(stop=>stop.id), id => html`<cb-button part="stop" exportparts="control:stop-control,label:stop-label,button-label:stop-label,icon:stop-icon,description:stop-description" ref="handles" data-stop-id=${id} data-bare data-semantic-host role="slider"
                    style=${() => `inset-inline-start:${this.stop(id).position}%;--cb-stop-color:${this.stop(id).color}`}
                    disabled=${() => this.blocked()} data-selected=${() => id === this.selectedStopId() ? '' : null}
                    accessible-label=${() => this.stopName(this.model().stops.findIndex(stop=>stop.id === id),this.stop(id).position)}
                    aria-valuemin="0" aria-valuemax="100" aria-valuenow=${() => this.stop(id).position}
                    aria-valuetext=${() => `${Math.round(this.stop(id).position*10)/10}%`} aria-description=${() => this.helpText || null}
                    onaction=${(event: Event) => { event.stopPropagation(); this.selectStop(id,event); }}
                    ondblclick=${(event: MouseEvent) => this.openStopColorEditor(id,event)}
                    onpointerdown=${(event: PointerEvent) => { const handle=this.handles.get(id); if(handle) this.startDrag(event,id,handle); }}
                    onpointermove=${(event: PointerEvent) => this.dragStop(event)} onpointerup=${(event: PointerEvent) => this.finishDrag(event)}
                    onpointercancel=${(event: PointerEvent) => this.finishDrag(event)} onkeydown=${(event: KeyboardEvent) => this.handleStopKey(event,id)}>
                    <span part="stop-swatch"></span></cb-button>`,{key:id=>id})}
                <cb-color-picker part="stop-color" ref="picker" exportparts="root:stop-color-root,trigger:stop-color-trigger,trigger-swatch:stop-color-swatch,popup:stop-color-popup"
                    style=${() => `--cb-selected-stop-position:${this.selectedStop().position}%`} value=${() => this.selectedStop().color}
                    accessible-label=${() => this.stopName(this.model().stops.findIndex(stop=>stop.id === this.selectedStopId()),this.selectedStop().position)}
                    disabled=${() => this.unavailable} read-only=${() => bool(this.readOnly)} allow-alpha=${() => bool(this.allowAlpha)} allow-sampler=${() => bool(this.allowSampler)}
                    swatches=${() => Array.isArray(this.swatches) ? this.swatches : []}
                    hue-label=${() => this.hueLabel} saturation-label=${() => this.saturationLabel} value-label=${() => this.brightnessLabel}
                    alpha-label=${() => this.alphaLabel} red-label=${() => this.redLabel} green-label=${() => this.greenLabel} blue-label=${() => this.blueLabel}
                    hex-label=${() => this.hexLabel} plane-label=${() => this.planeLabel} sampler-label=${() => this.samplerLabel} close-label=${() => this.closeLabel}
                    swatches-label=${() => this.swatchesLabel} add-swatch-label=${() => this.addSwatchLabel} remove-swatch-label=${() => this.removeSwatchLabel} transparent-label=${() => this.transparentLabel}
                    onchange=${(event: CustomEvent<{value:string}>) => { event.stopPropagation(); this.changeStopColor(this.selectedStopId(),event.detail.value,event,false); }}
                    onclose=${(event: CustomEvent<{originalEvent?:Event}>) => {
                        const source=event.detail.originalEvent;
                        if(source?.type === 'click' || source instanceof KeyboardEvent && source.key === 'Escape') queueMicrotask(()=>this.handles.get(this.selectedStopId())?.focus());
                    }}></cb-color-picker>
            </div></section>
            <input part="hidden-control" ref="form" type="text" tabindex="-1" value=${() => this.cssValue()}
                disabled=${() => this.unavailable} readonly=${() => bool(this.readOnly)} required=${() => bool(this.required) && !bool(this.readOnly)}
                aria-label=${() => this.accessibleName()} aria-invalid=${() => this.validationError() || null}
                aria-description=${() => [this.description,this.helpText,this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null}>
        </div>`;
    }
    private selectField(part:string,label:()=>string,value:()=>string,options:()=>readonly ChoiceOption[],handler:(event:CustomEvent<{value:string}>)=>void): Template {
        return html`<label part=${`select-field ${part}-field`}><span part=${`control-label ${part}-label`} hidden=${() => !label()}>${label}</span>
            <cb-select part=${part} ref=${part} accessible-label=${label} value=${value} options=${options}
                disabled=${() => this.blocked()} searchable="false" size=${() => this.size}
                onchange=${(event:CustomEvent<{value:string}>)=>{event.stopPropagation();handler(event);}}></cb-select></label>`;
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.formControl; }
    focus(options?: FocusOptions): void { (this.model().type === 'linear' ? this.angleInput : this.node('shape'))?.focus(options); }
    protected syncView(): void { this.syncForm(this.cssValue()); this.toggleAttribute('data-invalid',this.validationError()); }
    private openStopColorEditor(id: string, event: Event): void {
        if (!this.colorPicker || !this.selectStop(id, event))
            return;
        if (bool(this.colorPicker.open))
            this.colorPicker.setOpen(false, event);
        if (!this.colorPicker.setOpen(true, event))
            return;
        queueMicrotask(() => this.colorPicker?.focusEditor());
        event.preventDefault();
        event.stopPropagation();
    }
    private startDrag(event: PointerEvent, id: string, handle: Button): void {
        if (event.button !== 0 || handle.disabled)
            return;
        this.selectStop(id, event);
        this.drag = { id, pointerId: event.pointerId, handle, moved: false, position: this.selectedStop().position };
        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
    }
    private dragStop(event: PointerEvent): void {
        const drag = this.drag;
        const track = this.track;
        if (!drag || drag.pointerId !== event.pointerId || !track)
            return;
        const bounds = track.getBoundingClientRect();
        if (!bounds.width)
            return;
        drag.position = clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100);
        drag.moved = true;
        this.moveStop(drag.id, drag.position, event);
        event.preventDefault();
        event.stopPropagation();
    }
    private finishDrag(event: PointerEvent): void {
        const drag = this.drag;
        if (!drag || drag.pointerId !== event.pointerId)
            return;
        if (drag.handle.hasPointerCapture(event.pointerId))
            drag.handle.releasePointerCapture(event.pointerId);
        this.drag = undefined;
        if (drag.moved)
            this.moveStop(drag.id, drag.position, event, true);
        event.preventDefault();
        event.stopPropagation();
    }
    private handleStopKey(event: KeyboardEvent, id: string): void {
        const stop = this.model().stops.find(candidate => candidate.id === id);
        if (!stop)
            return;
        let position = stop.position;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
            position -= event.shiftKey ? 10 : 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
            position += event.shiftKey ? 10 : 1;
        else if (event.key === 'Home')
            position = 0;
        else if (event.key === 'End')
            position = 100;
        else if (event.key === 'Enter' || event.key === ' ') {
            this.openStopColorEditor(id, event);
            return;
        }
        else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            this.removeStop(id, event);
            this.handles.get(this.selectedStopId())?.focus();
            return;
        }
        else
            return;
        event.preventDefault();
        this.moveStop(id, position, event, true);
        this.handles.get(id)?.focus();
    }
    private largestGapPosition(): number {
        const stops = this.model().stops;
        let position = 50;
        let gap = -1;
        for (let index = 1; index < stops.length; index += 1) {
            const left = stops[index - 1];
            const right = stops[index];
            if (left && right && right.position - left.position > gap) {
                gap = right.position - left.position;
                position = left.position + gap / 2;
            }
        }
        return position;
    }
    private trackGradient(stops: readonly GradientStop[]): string {
        return `linear-gradient(90deg, ${stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
    }
    private isPosition(value: string): value is GradientPosition {
        return ['left top', 'center top', 'right top', 'left center', 'center', 'right center', 'left bottom', 'center bottom', 'right bottom'].includes(value);
    }
}
export { GradientEditorBase };
export type { GradientEditorProps, GradientChangeDetail } from './GradientEditorBase.js';
export { defaultGradientStops, normalizeGradientModel, normalizeGradientStops, parseGradient, serializeGradient, } from './gradient.js';
export type { GradientExtent, GradientModel, GradientModelInput, GradientPosition, GradientShape, GradientStop, GradientStopInput, GradientType, } from './gradient.js';
