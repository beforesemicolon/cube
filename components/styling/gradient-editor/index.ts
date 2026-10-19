import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { actionLabel, createBareButton, createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import type { Select } from '../../form/select/index.js';
import type { SegmentedControl } from '../../navigation/segmented-control/index.js';
import { bool, clamp, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import type { ColorPicker } from '../color-picker/index.js';
import { GradientEditorBase, type GradientEditorProps, } from './GradientEditorBase.js';
import type { GradientExtent, GradientPosition, GradientShape, GradientStop, GradientType } from './gradient.js';
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
    private rootNode?: HTMLElement;
    private modeControl?: SegmentedControl;
    private angleField?: HTMLElement;
    private angleLabelNode?: HTMLElement;
    private angleInput?: HTMLInputElement;
    private radialControls?: HTMLElement;
    private shapeControl?: Select;
    private extentControl?: Select;
    private positionControl?: Select;
    private shapeLabelNode?: HTMLElement;
    private extentLabelNode?: HTMLElement;
    private positionLabelNode?: HTMLElement;
    private stopsLabelNode?: HTMLElement;
    private addButton?: Button;
    private track?: HTMLElement;
    private trackColor?: HTMLElement;
    private colorPicker?: ColorPicker;
    private removeButton?: Button;
    private formControl?: HTMLInputElement;
    private drag?: DragState;
    private readonly handles = new Map<string, Button>();
    render(): Template {
        this.rootNode = element('div', { attributes: { part: 'root' } }) as HTMLDivElement;
        const geometry = element('div', { attributes: { part: 'geometry' } }) as HTMLDivElement;
        this.modeControl = document.createElement('cb-segmented-control') as SegmentedControl;
        this.modeControl.setAttribute('part', 'mode');
        this.modeControl.setAttribute('exportparts', 'group:mode-group,item:mode-item,item-label:mode-label');
        this.modeControl.addEventListener('change', event => {
            event.stopPropagation();
            const value = (event as CustomEvent<{
                value?: string;
            }>).detail.value;
            if (value === 'linear' || value === 'radial')
                this.changeType(value, event);
        });
        this.angleField = element('label', { attributes: { part: 'angle-field' } }) as HTMLLabelElement;
        this.angleLabelNode = element('span', { attributes: { part: 'control-label' } }) as HTMLSpanElement;
        this.angleInput = element('input', { attributes: { part: 'angle control' } }) as HTMLInputElement;
        this.angleInput.type = 'number';
        this.angleInput.step = '1';
        this.angleInput.inputMode = 'decimal';
        this.angleInput.addEventListener('input', event => this.changeAngle(this.angleInput?.valueAsNumber ?? this.angle, event, false));
        this.angleField.append(this.angleLabelNode, this.angleInput);
        this.radialControls = element('div', { attributes: { part: 'radial-controls' } }) as HTMLDivElement;
        this.shapeControl = this.createSelect('shape', event => {
            const value = event.detail.value;
            if (value === 'circle' || value === 'ellipse')
                this.changeShape(value, event);
        });
        this.extentControl = this.createSelect('extent', event => {
            const value = event.detail.value;
            if (value === 'closest-side' || value === 'closest-corner' || value === 'farthest-side' || value === 'farthest-corner')
                this.changeExtent(value, event);
        });
        this.positionControl = this.createSelect('position', event => {
            const value = event.detail.value;
            if (this.isPosition(value))
                this.changePosition(value, event);
        });
        const shapeField = element('label', { attributes: { part: 'select-field shape-field' } }) as HTMLLabelElement;
        const extentField = element('label', { attributes: { part: 'select-field extent-field' } }) as HTMLLabelElement;
        const radialPositionField = element('label', { attributes: { part: 'select-field position-field' } }) as HTMLLabelElement;
        this.shapeLabelNode = element('span', { attributes: { part: 'control-label shape-label' } }) as HTMLSpanElement;
        this.extentLabelNode = element('span', { attributes: { part: 'control-label extent-label' } }) as HTMLSpanElement;
        this.positionLabelNode = element('span', { attributes: { part: 'control-label position-label' } }) as HTMLSpanElement;
        shapeField.append(this.shapeLabelNode, this.shapeControl);
        extentField.append(this.extentLabelNode, this.extentControl);
        radialPositionField.append(this.positionLabelNode, this.positionControl);
        this.radialControls.append(shapeField, extentField, radialPositionField);
        geometry.append(this.modeControl, this.angleField, this.radialControls);
        const stopsSection = element('section', { attributes: { part: 'stops' } }) as HTMLElement;
        const stopsHeader = element('div', { attributes: { part: 'stops-header' } }) as HTMLDivElement;
        this.stopsLabelNode = element('span', { attributes: { part: 'section-label' } }) as HTMLSpanElement;
        this.addButton = createIconButton('add-stop', 'plus', event => this.addStop(this.largestGapPosition(), event));
        this.removeButton = createIconButton('remove-stop', 'close', event => {
            const selectedId = this.selectedStopId();
            if (!this.removeStop(selectedId, event))
                return;
            this.handles.get(this.selectedStopId())?.focus();
        });
        const stopActions = element('div', { attributes: { part: 'stop-actions' } }) as HTMLDivElement;
        stopActions.append(this.addButton, this.removeButton);
        stopsHeader.append(this.stopsLabelNode, stopActions);
        this.track = element('div', { attributes: { part: 'track' } }) as HTMLDivElement;
        this.trackColor = element('div', { attributes: { part: 'track-color' } }) as HTMLDivElement;
        this.track.append(this.trackColor);
        this.track.addEventListener('click', event => {
            if (event.target !== this.track && event.target !== this.trackColor)
                return;
            const bounds = this.track?.getBoundingClientRect();
            if (bounds?.width)
                this.addStop((event.clientX - bounds.left) / bounds.width * 100, event);
        });
        this.colorPicker = document.createElement('cb-color-picker') as ColorPicker;
        this.colorPicker.setAttribute('part', 'stop-color');
        this.colorPicker.setAttribute('exportparts', 'root:stop-color-root,trigger:stop-color-trigger,trigger-swatch:stop-color-swatch,popup:stop-color-popup');
        this.colorPicker.addEventListener('change', event => {
            event.stopPropagation();
            this.changeStopColor(this.selectedStopId(), (event as CustomEvent<{
                value: string;
            }>).detail.value, event, false);
        });
        this.colorPicker.addEventListener('close', event => {
            const originalEvent = (event as CustomEvent<{
                originalEvent?: Event;
            }>).detail.originalEvent;
            const escape = originalEvent?.type === 'keydown' && (originalEvent as KeyboardEvent).key === 'Escape';
            if (!escape && originalEvent?.type !== 'click')
                return;
            queueMicrotask(() => this.handles.get(this.selectedStopId())?.focus());
        });
        this.track.append(this.colorPicker);
        stopsSection.append(stopsHeader, this.track);
        this.formControl = element('input', { attributes: { part: 'hidden-control' } }) as HTMLInputElement;
        this.formControl.type = 'text';
        this.formControl.tabIndex = -1;
        this.rootNode.append(geometry, stopsSection, this.formControl);
        return html`<style part="styles">${css}</style>${this.rootNode}`;
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.formControl; }
    focus(options?: FocusOptions): void {
        if (this.model().type === 'linear')
            this.angleInput?.focus(options);
        else
            this.shapeControl?.focus(options);
    }
    protected syncView(): void {
        if (!this.rootNode || !this.modeControl || !this.angleField || !this.angleLabelNode || !this.angleInput
            || !this.radialControls || !this.shapeControl || !this.extentControl || !this.positionControl || !this.shapeLabelNode || !this.extentLabelNode || !this.positionLabelNode || !this.stopsLabelNode || !this.addButton
            || !this.track || !this.trackColor || !this.colorPicker || !this.removeButton || !this.formControl)
            return;
        const model = this.model();
        const value = this.cssValue();
        const unavailable = this.unavailable;
        const readOnly = bool(this.readOnly);
        const inaccessible = unavailable || readOnly;
        const accessibleName = this.accessibleName();
        Object.assign(this.modeControl, {
            value: model.type,
            label: '',
            accessibleLabel: scalarText(this.typeLabel) || accessibleName,
            items: [
                { id: 'linear', label: scalarText(this.linearLabel) || 'linear' },
                { id: 'radial', label: scalarText(this.radialLabel) || 'radial' },
            ],
            disabled: inaccessible,
            size: this.size,
        });
        this.angleField.hidden = model.type !== 'linear';
        this.angleLabelNode.textContent = scalarText(this.angleLabel);
        this.angleInput.value = String(model.angle);
        this.angleInput.disabled = inaccessible;
        this.angleInput.setAttribute('aria-label', scalarText(this.angleLabel));
        this.radialControls.hidden = model.type !== 'radial';
        this.syncSelect(this.shapeControl, this.shapeLabelNode, scalarText(this.shapeLabel), model.shape, [
            { value: 'circle', label: scalarText(this.circleLabel) || 'circle' },
            { value: 'ellipse', label: scalarText(this.ellipseLabel) || 'ellipse' },
        ], inaccessible);
        this.syncSelect(this.extentControl, this.extentLabelNode, scalarText(this.extentLabel), model.extent, [
            { value: 'closest-side', label: scalarText(this.closestSideLabel) || 'closest-side' },
            { value: 'closest-corner', label: scalarText(this.closestCornerLabel) || 'closest-corner' },
            { value: 'farthest-side', label: scalarText(this.farthestSideLabel) || 'farthest-side' },
            { value: 'farthest-corner', label: scalarText(this.farthestCornerLabel) || 'farthest-corner' },
        ], inaccessible);
        this.syncSelect(this.positionControl, this.positionLabelNode, scalarText(this.positionLabel), model.position, [
            { value: 'left top', label: scalarText(this.topLeftLabel) || 'left top' },
            { value: 'center top', label: scalarText(this.topLabel) || 'center top' },
            { value: 'right top', label: scalarText(this.topRightLabel) || 'right top' },
            { value: 'left center', label: scalarText(this.leftLabel) || 'left center' },
            { value: 'center', label: scalarText(this.centerLabel) || 'center' },
            { value: 'right center', label: scalarText(this.rightLabel) || 'right center' },
            { value: 'left bottom', label: scalarText(this.bottomLeftLabel) || 'left bottom' },
            { value: 'center bottom', label: scalarText(this.bottomLabel) || 'center bottom' },
            { value: 'right bottom', label: scalarText(this.bottomRightLabel) || 'right bottom' },
        ], inaccessible);
        this.stopsLabelNode.textContent = scalarText(this.stopsLabel);
        actionLabel(this.addButton, scalarText(this.addStopLabel));
        this.addButton.disabled = inaccessible;
        this.trackColor.style.setProperty('--cb-track-gradient', this.trackGradient(model.stops));
        this.track.setAttribute('role', 'group');
        this.track.setAttribute('aria-label', scalarText(this.stopsLabel));
        this.syncHandles(model.stops, inaccessible);
        const selected = this.selectedStop();
        this.colorPicker.style.setProperty('--cb-selected-stop-position', `${selected.position}%`);
        Object.assign(this.colorPicker, {
            value: selected.color,
            label: '',
            accessibleLabel: this.stopName(model.stops.findIndex(stop => stop.id === selected.id), selected.position),
            disabled: unavailable,
            readOnly,
            allowAlpha: bool(this.allowAlpha),
            allowSampler: bool(this.allowSampler),
            swatches: Array.isArray(this.swatches) ? this.swatches : [],
            hueLabel: scalarText(this.hueLabel),
            saturationLabel: scalarText(this.saturationLabel),
            valueLabel: scalarText(this.brightnessLabel),
            alphaLabel: scalarText(this.alphaLabel),
            redLabel: scalarText(this.redLabel),
            greenLabel: scalarText(this.greenLabel),
            blueLabel: scalarText(this.blueLabel),
            hexLabel: scalarText(this.hexLabel),
            planeLabel: scalarText(this.planeLabel),
            samplerLabel: scalarText(this.samplerLabel),
            closeLabel: scalarText(this.closeLabel),
            swatchesLabel: scalarText(this.swatchesLabel),
            addSwatchLabel: scalarText(this.addSwatchLabel),
            removeSwatchLabel: scalarText(this.removeSwatchLabel),
            transparentLabel: scalarText(this.transparentLabel),
        });
        actionLabel(this.removeButton, scalarText(this.removeStopLabel));
        this.removeButton.disabled = inaccessible || model.stops.length <= 2;
        this.formControl.value = value;
        this.formControl.disabled = unavailable;
        this.formControl.readOnly = readOnly;
        this.formControl.required = bool(this.required) && !readOnly;
        this.formControl.setAttribute('aria-label', accessibleName);
        this.syncForm(value);
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText)));
        const description = [scalarText(this.description), scalarText(this.helpText), error ? this.validationMessage : ''].filter(Boolean).join(' ') || null;
        aria(this.formControl, 'aria-description', description);
        aria(this.formControl, 'aria-invalid', error ? true : null);
        this.toggleAttribute('data-invalid', error);
    }
    private createSelect(part: string, handler: (event: CustomEvent<{
        value: string;
    }>) => void): Select {
        const control = document.createElement('cb-select') as Select;
        control.setAttribute('part', part);
        control.setAttribute('exportparts', `root:${part}-root,trigger:${part}-trigger,value:${part}-value,popup:${part}-popup,option:${part}-option`);
        control.addEventListener('change', event => {
            event.stopPropagation();
            handler(event as CustomEvent<{
                value: string;
            }>);
        });
        return control;
    }
    private syncSelect(control: Select, labelNode: HTMLElement, label: string, value: string, options: readonly ChoiceOption[], disabled: boolean): void {
        labelNode.textContent = label;
        labelNode.hidden = !label;
        Object.assign(control, { label: '', accessibleLabel: label, value, options, disabled, searchable: false, size: this.size });
    }
    private syncHandles(stops: readonly GradientStop[], disabled: boolean): void {
        if (!this.track)
            return;
        const ids = new Set(stops.map(stop => stop.id));
        for (const [id, handle] of this.handles)
            if (!ids.has(id)) {
                handle.remove();
                this.handles.delete(id);
            }
        for (const [index, stop] of stops.entries()) {
            let handle = this.handles.get(stop.id);
            if (!handle) {
                handle = createBareButton('stop', event => { event.stopPropagation(); this.selectStop(stop.id, event); });
                handle.dataset.stopId = stop.id;
                handle.setAttribute('role', 'slider');
                handle.append(element('span', { attributes: { part: 'stop-swatch' } }) as HTMLSpanElement);
                handle.addEventListener('dblclick', event => this.openStopColorEditor(stop.id, event));
                handle.addEventListener('pointerdown', event => this.startDrag(event, stop.id, handle!));
                handle.addEventListener('pointermove', event => this.dragStop(event));
                handle.addEventListener('pointerup', event => this.finishDrag(event));
                handle.addEventListener('pointercancel', event => this.finishDrag(event));
                handle.addEventListener('keydown', event => this.handleStopKey(event, stop.id));
                this.handles.set(stop.id, handle);
            }
            handle.style.insetInlineStart = `${stop.position}%`;
            handle.style.setProperty('--cb-stop-color', stop.color);
            handle.disabled = disabled;
            handle.toggleAttribute('data-selected', stop.id === this.selectedStopId());
            handle.setAttribute('aria-label', this.stopName(index, stop.position));
            handle.setAttribute('aria-valuemin', '0');
            handle.setAttribute('aria-valuemax', '100');
            handle.setAttribute('aria-valuenow', String(stop.position));
            handle.setAttribute('aria-valuetext', `${Math.round(stop.position * 10) / 10}%`);
            aria(handle, 'aria-description', scalarText(this.helpText) || null);
            if (handle.parentElement !== this.track)
                this.track.append(handle);
        }
    }
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
