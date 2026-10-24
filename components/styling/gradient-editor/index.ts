import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { pick, isNot, or, and, type Template, html, repeat } from '../../core/runtime.js'

import type { Button } from '../../action/button/index.js';
import { bool, clamp, scalarText } from '../../core/value.js';

import type { ColorPicker } from '../color-picker/index.js';
import type { UnitInput } from '../../form/unit-input/index.js';
import { GradientEditorBase } from './GradientEditorBase.js';
import type { GradientPosition, GradientStop } from './gradient.js';

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
    stylesheet = componentStylesheet

    private node(name:string): HTMLElement | undefined { const node=this.refs[name]?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get track(): HTMLElement | undefined { return this.node('track'); }
    private get angleInput(): UnitInput | undefined { return this.node('angle') as UnitInput | undefined; }
    private get colorPicker(): ColorPicker | undefined { return this.node('picker') as ColorPicker | undefined; }
    private get formControl(): HTMLInputElement | undefined { const node=this.node('form'); return node instanceof HTMLInputElement ? node : undefined; }
    private get handles(): Map<string,Button> { return new Map((this.refs.handles ?? []).flatMap(node => node instanceof HTMLElement && node.dataset.stopId ? [[node.dataset.stopId,node as Button] as const] : [])); }
    private drag?: DragState;
    private blocked = or(() => this.unavailable, () => this.readOnly);
    private stop(id:string): GradientStop { return this.model().stops.find(stop=>stop.id === id) ?? this.selectedStop(); }
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText))); }
    render(): Template {
        return html`<div part="root"><div part="geometry">
            <cb-segmented-control part="mode" exportparts="group:mode-group,item:mode-item,item-label:mode-label"
                value=${pick(this.model, "type")} accessible-label=${() => this.typeLabel || this.accessibleName()} disabled=${this.blocked} size=${this.props.size}
                items=${() => [{id:'linear',label:this.linearLabel || 'linear'},{id:'radial',label:this.radialLabel || 'radial'}]}
                onchange=${(event: CustomEvent<{value:string}>) => { event.stopPropagation(); if(event.detail.value === 'linear' || event.detail.value === 'radial') this.changeType(event.detail.value,event); }}></cb-segmented-control>
            <div part="angle-field" hidden=${isNot(() => this.model().type, 'linear')}><span part="control-label">${this.props.angleLabel}</span>
                <cb-unit-input part="angle" exportparts="control:angle-control" ref="angle" unit="deg" units=${['deg']} min="-1000000" max="1000000" step="1" size=${this.props.size}
                    value=${pick(this.model, "angle")} disabled=${this.blocked} accessible-label=${this.props.angleLabel}
                    onchange=${(event: CustomEvent<{ value: number | null }>) => { event.stopPropagation(); this.changeAngle(event.detail.value ?? this.model().angle,event,false); }}></cb-unit-input></div>
            <div part="radial-controls" hidden=${isNot(() => this.model().type, 'radial')}>
                ${this.selectField('shape',this.props.shapeLabel,pick(this.model, "shape"),() => [
                    {value:'circle',label:this.circleLabel || 'circle'},{value:'ellipse',label:this.ellipseLabel || 'ellipse'}
                ],event => { const value=event.detail.value; if(value === 'circle' || value === 'ellipse') this.changeShape(value,event); })}
                ${this.selectField('extent',this.props.extentLabel,pick(this.model, "extent"),() => [
                    {value:'closest-side',label:this.closestSideLabel || 'closest-side'},{value:'closest-corner',label:this.closestCornerLabel || 'closest-corner'},
                    {value:'farthest-side',label:this.farthestSideLabel || 'farthest-side'},{value:'farthest-corner',label:this.farthestCornerLabel || 'farthest-corner'}
                ],event => { const value=event.detail.value; if(value === 'closest-side' || value === 'closest-corner' || value === 'farthest-side' || value === 'farthest-corner') this.changeExtent(value,event); })}
                ${this.selectField('position',this.props.positionLabel,pick(this.model, "position"),() => [
                    {value:'left top',label:this.topLeftLabel || 'left top'},{value:'center top',label:this.topLabel || 'center top'},
                    {value:'right top',label:this.topRightLabel || 'right top'},{value:'left center',label:this.leftLabel || 'left center'},
                    {value:'center',label:this.centerLabel || 'center'},{value:'right center',label:this.rightLabel || 'right center'},
                    {value:'left bottom',label:this.bottomLeftLabel || 'left bottom'},{value:'center bottom',label:this.bottomLabel || 'center bottom'},
                    {value:'right bottom',label:this.bottomRightLabel || 'right bottom'}
                ],event => { if(this.isPosition(event.detail.value)) this.changePosition(event.detail.value,event); })}
            </div></div><section part="stops"><div part="stops-header"><span part="section-label">${this.props.stopsLabel}</span><div part="stop-actions">
                <cb-button part="add-stop" exportparts="control:add-stop-control,label:add-stop-label,button-label:add-stop-label,icon:add-stop-icon,description:add-stop-description" icon-only icon="plus" variant="ghost" size="sm" accessible-label=${this.props.addStopLabel} disabled=${this.blocked}
                    onaction=${(event: Event) => { event.stopPropagation(); this.addStop(this.largestGapPosition(),event); }}></cb-button>
                <cb-button part="remove-stop" exportparts="control:remove-stop-control,label:remove-stop-label,button-label:remove-stop-label,icon:remove-stop-icon,description:remove-stop-description" icon-only icon="close" variant="ghost" size="sm" accessible-label=${this.props.removeStopLabel}
                    disabled=${or(this.blocked, () => this.model().stops.length <= 2)}
                    onaction=${(event: Event) => { event.stopPropagation(); if(this.removeStop(this.selectedStopId(),event)) queueMicrotask(()=>this.handles.get(this.selectedStopId())?.focus()); }}></cb-button>
            </div></div><div part="track" ref="track" role="group" aria-label=${this.props.stopsLabel}
                onclick=${(event: MouseEvent) => {
                    if(!(event.target instanceof HTMLElement) || !event.target.matches('[part~=track],[part~=track-color]')) return;
                    const bounds=this.track?.getBoundingClientRect(); if(bounds?.width) this.addStop((event.clientX-bounds.left)/bounds.width*100,event);
                }}>
                <div part="track-color" style=${() => `--cb-track-gradient:${this.trackGradient(this.model().stops)}`}></div>
                ${repeat(() => this.model().stops.map(stop=>stop.id), id => html`<cb-button part="stop" exportparts="control:stop-control,label:stop-label,button-label:stop-label,icon:stop-icon,description:stop-description" ref="handles" data-stop-id=${id} data-bare data-semantic-host role="slider"
                    style=${() => `inset-inline-start:${this.stop(id).position}%;--cb-stop-color:${this.stop(id).color}`}
                    disabled=${this.blocked} data-selected=${() => id === this.selectedStopId() ? '' : null}
                    accessible-label=${() => this.stopName(this.model().stops.findIndex(stop=>stop.id === id),this.stop(id).position)}
                    aria-valuemin="0" aria-valuemax="100" aria-valuenow=${() => this.stop(id).position}
                    aria-valuetext=${() => `${Math.round(this.stop(id).position*10)/10}%`} aria-description=${() => this.helpText || null}
                    onaction=${(event: Event) => { event.stopPropagation(); this.selectStop(id,event); }}
                    ondblclick=${(event: MouseEvent) => this.openStopColorEditor(id,event)}
                    onpointerdown=${(event: PointerEvent) => { const handle=this.handles.get(id); if(handle) this.startDrag(event,id,handle); }}
                    onpointermove=${this.dragStop} onpointerup=${this.finishDrag}
                    onpointercancel=${this.finishDrag} onkeydown=${(event: KeyboardEvent) => this.handleStopKey(event,id)}>
                    <span part="stop-swatch"></span></cb-button>`,{key:id=>id})}
                <cb-color-picker part="stop-color" ref="picker" exportparts="root:stop-color-root,trigger:stop-color-trigger,trigger-swatch:stop-color-swatch,popup:stop-color-popup"
                    style=${() => `--cb-selected-stop-position:${this.selectedStop().position}%`} value=${pick(this.selectedStop, "color")}
                    accessible-label=${() => this.stopName(this.model().stops.findIndex(stop=>stop.id === this.selectedStopId()),this.selectedStop().position)}
                    disabled=${() => this.unavailable} read-only=${this.props.readOnly} allow-alpha=${this.props.allowAlpha} allow-sampler=${this.props.allowSampler}
                    swatches=${() => JSON.stringify(this.props.swatches?.() || [])}
                    hue-label=${this.props.hueLabel} saturation-label=${this.props.saturationLabel} value-label=${this.props.brightnessLabel}
                    alpha-label=${this.props.alphaLabel} red-label=${this.props.redLabel} green-label=${this.props.greenLabel} blue-label=${this.props.blueLabel}
                    hex-label=${this.props.hexLabel} plane-label=${this.props.planeLabel} sampler-label=${this.props.samplerLabel} close-label=${this.props.closeLabel}
                    swatches-label=${this.props.swatchesLabel} add-swatch-label=${this.props.addSwatchLabel} update-swatch-label=${this.props.updateSwatchLabel} remove-swatch-label=${this.props.removeSwatchLabel} transparent-label=${this.props.transparentLabel}
                    onchange=${(event: CustomEvent<{value:string}>) => { event.stopPropagation(); this.changeStopColor(this.selectedStopId(),event.detail.value,event,false); }}
                    onclose=${(event: CustomEvent<{originalEvent?:Event}>) => {
                        const source=event.detail.originalEvent;
                        if(source?.type === 'click' || source instanceof KeyboardEvent && source.key === 'Escape') queueMicrotask(()=>this.handles.get(this.selectedStopId())?.focus());
                    }}></cb-color-picker>
            </div></section>
            <input part="hidden-control" ref="form" type="text" tabindex="-1" value=${this.cssValue}
                disabled=${() => this.unavailable} readonly=${this.props.readOnly} required=${and(this.props.required, isNot(this.props.readOnly))}
                aria-label=${this.accessibleName} aria-invalid=${() => this.validationError() || null}
                aria-description=${() => [this.description,this.helpText,this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null}>
        </div>`;
    }
    private selectField(part:string,label:(()=>string|undefined)|undefined,value:()=>string,options:()=>readonly ChoiceOption[],handler:(event:CustomEvent<{value:string}>)=>void): Template {
        return html`<label part=${`select-field ${part}-field`}><span part=${`control-label ${part}-label`} hidden=${isNot(() => label?.())}>${label}</span>
            <cb-select part=${part} ref=${part} accessible-label=${label} value=${value} options=${options}
                disabled=${this.blocked} searchable="false" size=${this.props.size}
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
    private dragStop = (event: PointerEvent): void => {
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
    private finishDrag = (event: PointerEvent): void => {
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

register('cb-gradient-editor', GradientEditor)
