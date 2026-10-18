import { actionLabel, createIconButton } from '../../action/create.js'
import type { IconButton } from '../../action/icon-button/index.js'
import type { Select } from '../../form/select/index.js'
import '../../form/select/index.js'
import type { SegmentedControl } from '../../navigation/segmented-control/index.js'
import '../../navigation/segmented-control/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { bool, clamp, scalarText } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import type { ColorPicker } from '../color-picker/index.js'
import '../color-picker/index.js'
import {
    GradientEditorBase, type GradientEditorProps,
} from './GradientEditorBase.js'
import type { GradientExtent, GradientPosition, GradientShape, GradientStop, GradientType } from './gradient.js'

const css = editorCSS + `
:host{display:block;inline-size:min(100%,var(--component-gradient-editor-width,560px));container-type:inline-size}
[part~=field]{display:grid;gap:var(--spacing-md,12px);min-inline-size:0}
[part~=label]{font-size:var(--component-label-font-size,12px);font-weight:650}
[part~=preview-shell],[part~=track]{background-color:${v('--color-surface')};background-image:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0);background-size:12px 12px}
[part~=preview-shell]{position:relative;overflow:hidden;block-size:var(--component-gradient-preview-height,124px);border:1px solid ${v('--color-border')};border-radius:var(--radius-lg,12px)}
[part~=preview]{position:absolute;inset:0;background:var(--cb-gradient)}
[part~=geometry]{display:flex;align-items:end;gap:var(--spacing-sm,8px);flex-wrap:wrap}
[part~=mode]{flex:none}
[part~=angle-field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:88px}
[part~=control-label],[part~=section-label],[part~=value-label]{color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);font-weight:600}
[part~=angle],[part~=stop-position]{inline-size:88px;min-block-size:var(--cb-height);padding:4px 8px;border:1px solid ${v('--color-border')};border-radius:var(--radius-sm);background:${v('--color-surface-muted')};font-variant-numeric:tabular-nums}
[part~=angle]::-webkit-inner-spin-button,[part~=stop-position]::-webkit-inner-spin-button{appearance:none;margin:0}
[part~=radial-controls]{display:flex;align-items:end;gap:var(--spacing-sm,8px);flex:1;flex-wrap:wrap}
[part~=shape],[part~=extent],[part~=position]{--component-select-width:var(--component-gradient-select-width,132px)}
[part~=stops]{display:grid;gap:var(--spacing-sm,8px)}
[part~=stops-header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px)}
[part~=track]{position:relative;block-size:38px;margin:0 10px 32px;border:1px solid ${v('--color-border')};border-radius:var(--radius-md);box-shadow:inset 0 0 0 1px color-mix(in srgb,#fff 35%,transparent);cursor:crosshair;touch-action:none;user-select:none}
[part~=track-color]{position:absolute;inset:0;border-radius:calc(var(--radius-md) - 1px);background:var(--cb-track-gradient);pointer-events:none}
[part~=stop]{position:absolute;inset-block-start:100%;display:block;inline-size:22px;min-inline-size:22px;block-size:28px;min-block-size:28px;padding:8px 3px 2px;border:0;border-radius:0;background:transparent!important;transform:translate(-50%,3px);color:${v('--color-muted-foreground')};cursor:ew-resize;touch-action:none}
[part~=stop]::before{content:'';position:absolute;inset-block-start:0;inset-inline-start:7px;border-inline:4px solid transparent;border-block-end:7px solid currentColor}
[part~=stop-swatch]{display:block;inline-size:16px;block-size:16px;border:2px solid ${v('--color-surface-raised')};border-radius:3px;background:var(--cb-stop-color);box-shadow:0 0 0 1px currentColor}
[part~=stop][data-selected]{z-index:1;color:${v('--color-primary')}}
[part~=stop][data-selected] [part~=stop-swatch]{box-shadow:0 0 0 2px currentColor}
[part~=stop-editor]{display:grid;grid-template-columns:auto minmax(100px,1fr) auto;align-items:end;gap:var(--spacing-sm,8px);padding:var(--spacing-sm,8px);border:1px solid ${v('--color-separator')};border-radius:var(--radius-md);background:${v('--color-surface-muted')}}
[part~=stop-color]{inline-size:var(--component-color-picker-trigger-size,36px);min-inline-size:var(--component-color-picker-trigger-size,36px)}
[part~=stop-position-field]{display:grid;gap:var(--spacing-xs,4px)}
[part~=stop-position]{inline-size:100%}
[part~=value-row]{display:grid;gap:var(--spacing-xs,4px)}
[part~=value]{display:block;min-inline-size:0;padding:var(--spacing-sm,8px);overflow:auto;border:1px solid ${v('--color-separator')};border-radius:var(--radius-sm);background:${v('--color-surface-muted')};font:var(--component-code-font,11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace);white-space:nowrap}
[part~=help],[part~=description],[part~=error]{margin:0}
[part~=hidden-control]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)}
:host([data-disabled]) [part~=track]{cursor:not-allowed;opacity:var(--component-disabled-opacity,.5)}
:host([data-invalid]) [part~=preview-shell]{border-color:${v('--color-danger')}}
@container(max-width:420px){[part~=preview-shell]{block-size:96px}[part~=geometry],[part~=radial-controls]{display:grid;grid-template-columns:1fr 1fr;inline-size:100%}[part~=mode]{grid-column:1/-1}[part~=shape],[part~=extent],[part~=position]{--component-select-width:100%}[part~=stop-editor]{grid-template-columns:auto 1fr auto}}
@media(pointer:coarse){[part~=track]{block-size:44px;margin-block-end:38px}[part~=stop]{inline-size:30px;min-inline-size:30px;block-size:34px;min-block-size:34px}[part~=stop]::before{inset-inline-start:11px}}
`

interface DragState {
    readonly id: string
    readonly pointerId: number
    readonly handle: HTMLButtonElement
    moved: boolean
    position: number
}

interface ChoiceOption {
    readonly value: string
    readonly label: string
}

export class GradientEditor extends GradientEditorBase {
    private field?: HTMLElement
    private labelNode?: HTMLLabelElement
    private preview?: HTMLElement
    private modeControl?: SegmentedControl
    private angleField?: HTMLElement
    private angleLabelNode?: HTMLElement
    private angleInput?: HTMLInputElement
    private radialControls?: HTMLElement
    private shapeControl?: Select
    private extentControl?: Select
    private positionControl?: Select
    private stopsLabelNode?: HTMLElement
    private addButton?: IconButton
    private track?: HTMLElement
    private trackColor?: HTMLElement
    private colorPicker?: ColorPicker
    private stopPositionLabelNode?: HTMLElement
    private stopPositionInput?: HTMLInputElement
    private removeButton?: IconButton
    private valueLabelNode?: HTMLElement
    private valueNode?: HTMLOutputElement
    private helpNode?: HTMLElement
    private descriptionNode?: HTMLElement
    private errorNode?: HTMLElement
    private formControl?: HTMLInputElement
    private drag?: DragState
    private readonly handles = new Map<string, HTMLButtonElement>()

    render(): Node {
        this.field = el('div', 'field')
        this.labelNode = el('label', 'label')
        this.labelNode.id = uid('cb-gradient-editor-label')

        const previewShell = el('div', 'preview-shell')
        this.preview = el('div', 'preview')
        previewShell.append(this.preview)

        const geometry = el('div', 'geometry')
        this.modeControl = document.createElement('cb-segmented-control') as SegmentedControl
        this.modeControl.setAttribute('part', 'mode')
        this.modeControl.setAttribute('exportparts', 'group:mode-group,item:mode-item,item-label:mode-label')
        this.modeControl.addEventListener('cb-change', event => {
            event.stopPropagation()
            const value = (event as CustomEvent<{ value?: string }>).detail.value
            if (value === 'linear' || value === 'radial') this.changeType(value, event)
        })

        this.angleField = el('label', 'angle-field')
        this.angleLabelNode = el('span', 'control-label')
        this.angleInput = el('input', 'angle control')
        this.angleInput.type = 'number'
        this.angleInput.step = '1'
        this.angleInput.inputMode = 'decimal'
        this.angleInput.addEventListener('input', event => this.changeAngle(this.angleInput?.valueAsNumber ?? this.angle, event, false))
        this.angleInput.addEventListener('change', event => this.changeAngle(this.angleInput?.valueAsNumber ?? this.angle, event))
        this.angleField.append(this.angleLabelNode, this.angleInput)

        this.radialControls = el('div', 'radial-controls')
        this.shapeControl = this.createSelect('shape', event => {
            const value = event.detail.value
            if (value === 'circle' || value === 'ellipse') this.changeShape(value, event)
        })
        this.extentControl = this.createSelect('extent', event => {
            const value = event.detail.value
            if (value === 'closest-side' || value === 'closest-corner' || value === 'farthest-side' || value === 'farthest-corner') this.changeExtent(value, event)
        })
        this.positionControl = this.createSelect('position', event => {
            const value = event.detail.value
            if (this.isPosition(value)) this.changePosition(value, event)
        })
        this.radialControls.append(this.shapeControl, this.extentControl, this.positionControl)
        geometry.append(this.modeControl, this.angleField, this.radialControls)

        const stopsSection = el('section', 'stops')
        const stopsHeader = el('div', 'stops-header')
        this.stopsLabelNode = el('span', 'section-label')
        this.addButton = createIconButton('add-stop', 'plus', event => this.addStop(this.largestGapPosition(), event))
        stopsHeader.append(this.stopsLabelNode, this.addButton)
        this.track = el('div', 'track')
        this.trackColor = el('div', 'track-color')
        this.track.append(this.trackColor)
        this.track.addEventListener('click', event => {
            if (event.target !== this.track && event.target !== this.trackColor) return
            const bounds = this.track?.getBoundingClientRect()
            if (bounds?.width) this.addStop((event.clientX - bounds.left) / bounds.width * 100, event)
        })
        const stopEditor = el('div', 'stop-editor')
        this.colorPicker = document.createElement('cb-color-picker') as ColorPicker
        this.colorPicker.setAttribute('part', 'stop-color')
        this.colorPicker.setAttribute('exportparts', 'field:stop-color-field,trigger:stop-color-trigger,trigger-swatch:stop-color-swatch,popup:stop-color-popup')
        this.colorPicker.addEventListener('cb-input', event => {
            event.stopPropagation()
            this.changeStopColor(this.selectedStopId(), (event as CustomEvent<{ value: string }>).detail.value, event, false)
        })
        this.colorPicker.addEventListener('cb-change', event => {
            event.stopPropagation()
            this.changeStopColor(this.selectedStopId(), (event as CustomEvent<{ value: string }>).detail.value, event)
        })
        const positionField = el('label', 'stop-position-field')
        this.stopPositionLabelNode = el('span', 'control-label')
        this.stopPositionInput = el('input', 'stop-position control')
        this.stopPositionInput.type = 'number'
        this.stopPositionInput.min = '0'
        this.stopPositionInput.max = '100'
        this.stopPositionInput.step = '.1'
        this.stopPositionInput.inputMode = 'decimal'
        this.stopPositionInput.addEventListener('input', event => this.moveStop(this.selectedStopId(), this.stopPositionInput?.valueAsNumber ?? 0, event))
        this.stopPositionInput.addEventListener('change', event => this.moveStop(this.selectedStopId(), this.stopPositionInput?.valueAsNumber ?? 0, event, true))
        positionField.append(this.stopPositionLabelNode, this.stopPositionInput)
        this.removeButton = createIconButton('remove-stop', 'close', event => this.removeStop(this.selectedStopId(), event))
        stopEditor.append(this.colorPicker, positionField, this.removeButton)
        stopsSection.append(stopsHeader, this.track, stopEditor)

        const valueRow = el('div', 'value-row')
        this.valueLabelNode = el('span', 'value-label')
        this.valueNode = el('output', 'value')
        valueRow.append(this.valueLabelNode, this.valueNode)
        this.helpNode = el('p', 'help')
        this.descriptionNode = el('p', 'description')
        this.descriptionNode.id = uid('cb-gradient-editor-description')
        this.errorNode = el('p', 'error')
        this.errorNode.id = uid('cb-gradient-editor-error')
        this.errorNode.setAttribute('role', 'alert')
        this.formControl = el('input', 'hidden-control')
        this.formControl.type = 'text'
        this.formControl.tabIndex = -1
        this.field.append(this.labelNode, previewShell, geometry, stopsSection, valueRow, this.helpNode, this.descriptionNode, this.errorNode, this.formControl)
        return fragment(sheet(css), this.field)
    }

    protected fieldElement(): HTMLInputElement | undefined { return this.formControl }

    protected syncView(): void {
        if (!this.field || !this.labelNode || !this.preview || !this.modeControl || !this.angleField || !this.angleLabelNode || !this.angleInput
            || !this.radialControls || !this.shapeControl || !this.extentControl || !this.positionControl || !this.stopsLabelNode || !this.addButton
            || !this.track || !this.trackColor || !this.colorPicker || !this.stopPositionLabelNode || !this.stopPositionInput || !this.removeButton
            || !this.valueLabelNode || !this.valueNode || !this.helpNode || !this.descriptionNode || !this.errorNode || !this.formControl) return

        const model = this.model()
        const value = this.cssValue()
        const unavailable = this.unavailable
        const readOnly = bool(this.readOnly)
        const inaccessible = unavailable || readOnly
        const visibleLabel = scalarText(this.label)
        const accessibleName = this.accessibleName()
        this.labelNode.textContent = visibleLabel
        this.labelNode.hidden = !visibleLabel
        this.preview.style.setProperty('--cb-gradient', value)
        this.preview.setAttribute('role', 'img')
        this.preview.setAttribute('aria-label', scalarText(this.previewLabel) || accessibleName)

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
        })
        this.angleField.hidden = model.type !== 'linear'
        this.angleLabelNode.textContent = scalarText(this.angleLabel)
        this.angleInput.value = String(model.angle)
        this.angleInput.disabled = inaccessible
        this.angleInput.setAttribute('aria-label', scalarText(this.angleLabel))
        this.radialControls.hidden = model.type !== 'radial'
        this.syncSelect(this.shapeControl, scalarText(this.shapeLabel), model.shape, [
            { value: 'circle', label: scalarText(this.circleLabel) || 'circle' },
            { value: 'ellipse', label: scalarText(this.ellipseLabel) || 'ellipse' },
        ], inaccessible)
        this.syncSelect(this.extentControl, scalarText(this.extentLabel), model.extent, [
            { value: 'closest-side', label: scalarText(this.closestSideLabel) || 'closest-side' },
            { value: 'closest-corner', label: scalarText(this.closestCornerLabel) || 'closest-corner' },
            { value: 'farthest-side', label: scalarText(this.farthestSideLabel) || 'farthest-side' },
            { value: 'farthest-corner', label: scalarText(this.farthestCornerLabel) || 'farthest-corner' },
        ], inaccessible)
        this.syncSelect(this.positionControl, scalarText(this.positionLabel), model.position, [
            { value: 'left top', label: scalarText(this.topLeftLabel) || 'left top' },
            { value: 'center top', label: scalarText(this.topLabel) || 'center top' },
            { value: 'right top', label: scalarText(this.topRightLabel) || 'right top' },
            { value: 'left center', label: scalarText(this.leftLabel) || 'left center' },
            { value: 'center', label: scalarText(this.centerLabel) || 'center' },
            { value: 'right center', label: scalarText(this.rightLabel) || 'right center' },
            { value: 'left bottom', label: scalarText(this.bottomLeftLabel) || 'left bottom' },
            { value: 'center bottom', label: scalarText(this.bottomLabel) || 'center bottom' },
            { value: 'right bottom', label: scalarText(this.bottomRightLabel) || 'right bottom' },
        ], inaccessible)

        this.stopsLabelNode.textContent = scalarText(this.stopsLabel)
        actionLabel(this.addButton, scalarText(this.addStopLabel))
        this.addButton.disabled = inaccessible
        this.trackColor.style.setProperty('--cb-track-gradient', this.trackGradient(model.stops))
        this.track.setAttribute('role', 'group')
        this.track.setAttribute('aria-label', scalarText(this.stopsLabel))
        this.syncHandles(model.stops, inaccessible)

        const selected = this.selectedStop()
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
            transparentLabel: scalarText(this.transparentLabel),
        })
        this.stopPositionLabelNode.textContent = scalarText(this.stopPositionLabel)
        this.stopPositionInput.value = String(selected.position)
        this.stopPositionInput.disabled = inaccessible
        this.stopPositionInput.setAttribute('aria-label', scalarText(this.stopPositionLabel))
        actionLabel(this.removeButton, scalarText(this.removeStopLabel))
        this.removeButton.disabled = inaccessible || model.stops.length <= 2
        this.valueLabelNode.textContent = scalarText(this.valueLabel)
        this.valueNode.value = value
        this.valueNode.textContent = value
        this.helpNode.textContent = scalarText(this.helpText)
        this.helpNode.hidden = !scalarText(this.helpText)
        this.descriptionNode.textContent = scalarText(this.description)
        this.descriptionNode.hidden = !scalarText(this.description)

        this.formControl.value = value
        this.formControl.disabled = unavailable
        this.formControl.readOnly = readOnly
        this.formControl.required = bool(this.required) && !readOnly
        this.formControl.setAttribute('aria-label', accessibleName)
        this.syncForm(value)
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText)))
        this.errorNode.textContent = error ? this.validationMessage : ''
        this.errorNode.hidden = !error
        const describedBy = [scalarText(this.description) ? this.descriptionNode.id : '', error ? this.errorNode.id : ''].filter(Boolean).join(' ') || null
        aria(this.preview, 'aria-describedby', describedBy)
        aria(this.preview, 'aria-invalid', error ? true : null)
        this.toggleAttribute('data-invalid', error)
    }

    private createSelect(part: string, handler: (event: CustomEvent<{ value: string }>) => void): Select {
        const control = document.createElement('cb-select') as Select
        control.setAttribute('part', part)
        control.setAttribute('exportparts', `field:${part}-field,label:${part}-label,trigger:${part}-trigger,value:${part}-value,popup:${part}-popup,option:${part}-option`)
        control.addEventListener('cb-change', event => {
            event.stopPropagation()
            handler(event as CustomEvent<{ value: string }>)
        })
        return control
    }

    private syncSelect(control: Select, label: string, value: string, options: readonly ChoiceOption[], disabled: boolean): void {
        Object.assign(control, { label, accessibleLabel: label, value, options, disabled, searchable: false, size: this.size })
    }

    private syncHandles(stops: readonly GradientStop[], disabled: boolean): void {
        if (!this.track) return
        const ids = new Set(stops.map(stop => stop.id))
        for (const [id, handle] of this.handles) if (!ids.has(id)) { handle.remove(); this.handles.delete(id) }
        for (const [index, stop] of stops.entries()) {
            let handle = this.handles.get(stop.id)
            if (!handle) {
                handle = el('button', 'stop')
                handle.type = 'button'
                handle.dataset.stopId = stop.id
                handle.setAttribute('role', 'slider')
                handle.append(el('span', 'stop-swatch'))
                handle.addEventListener('click', event => { event.stopPropagation(); this.selectStop(stop.id, event) })
                handle.addEventListener('pointerdown', event => this.startDrag(event, stop.id, handle!))
                handle.addEventListener('pointermove', event => this.dragStop(event))
                handle.addEventListener('pointerup', event => this.finishDrag(event))
                handle.addEventListener('pointercancel', event => this.finishDrag(event))
                handle.addEventListener('keydown', event => this.handleStopKey(event, stop.id))
                this.handles.set(stop.id, handle)
            }
            handle.style.insetInlineStart = `${stop.position}%`
            handle.style.setProperty('--cb-stop-color', stop.color)
            handle.disabled = disabled
            handle.toggleAttribute('data-selected', stop.id === this.selectedStopId())
            handle.setAttribute('aria-label', this.stopName(index, stop.position))
            handle.setAttribute('aria-valuemin', '0')
            handle.setAttribute('aria-valuemax', '100')
            handle.setAttribute('aria-valuenow', String(stop.position))
            handle.setAttribute('aria-valuetext', `${Math.round(stop.position * 10) / 10}%`)
            if (handle.parentElement !== this.track) this.track.append(handle)
        }
    }

    private startDrag(event: PointerEvent, id: string, handle: HTMLButtonElement): void {
        if (event.button !== 0 || handle.disabled) return
        this.selectStop(id, event)
        this.drag = { id, pointerId: event.pointerId, handle, moved: false, position: this.selectedStop().position }
        handle.setPointerCapture(event.pointerId)
        event.preventDefault()
        event.stopPropagation()
    }

    private dragStop(event: PointerEvent): void {
        const drag = this.drag
        const track = this.track
        if (!drag || drag.pointerId !== event.pointerId || !track) return
        const bounds = track.getBoundingClientRect()
        if (!bounds.width) return
        drag.position = clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100)
        drag.moved = true
        this.moveStop(drag.id, drag.position, event)
        event.preventDefault()
        event.stopPropagation()
    }

    private finishDrag(event: PointerEvent): void {
        const drag = this.drag
        if (!drag || drag.pointerId !== event.pointerId) return
        if (drag.handle.hasPointerCapture(event.pointerId)) drag.handle.releasePointerCapture(event.pointerId)
        this.drag = undefined
        if (drag.moved) this.moveStop(drag.id, drag.position, event, true)
        event.preventDefault()
        event.stopPropagation()
    }

    private handleStopKey(event: KeyboardEvent, id: string): void {
        const stop = this.model().stops.find(candidate => candidate.id === id)
        if (!stop) return
        let position = stop.position
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') position -= event.shiftKey ? 10 : 1
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') position += event.shiftKey ? 10 : 1
        else if (event.key === 'Home') position = 0
        else if (event.key === 'End') position = 100
        else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault()
            this.removeStop(id, event)
            this.handles.get(this.selectedStopId())?.focus()
            return
        } else return
        event.preventDefault()
        this.moveStop(id, position, event, true)
        this.handles.get(id)?.focus()
    }

    private largestGapPosition(): number {
        const stops = this.model().stops
        let position = 50
        let gap = -1
        for (let index = 1; index < stops.length; index += 1) {
            const left = stops[index - 1]
            const right = stops[index]
            if (left && right && right.position - left.position > gap) {
                gap = right.position - left.position
                position = left.position + gap / 2
            }
        }
        return position
    }

    private trackGradient(stops: readonly GradientStop[]): string {
        return `linear-gradient(90deg, ${stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`
    }

    private isPosition(value: string): value is GradientPosition {
        return ['left top', 'center top', 'right top', 'left center', 'center', 'right center', 'left bottom', 'center bottom', 'right bottom'].includes(value)
    }
}

register('cb-gradient-editor', GradientEditor)
export { GradientEditorBase }
export type { GradientEditorProps, GradientChangeDetail } from './GradientEditorBase.js'
export {
    defaultGradientStops, normalizeGradientModel, normalizeGradientStops, parseGradient, serializeGradient,
} from './gradient.js'
export type {
    GradientExtent, GradientModel, GradientModelInput, GradientPosition, GradientShape, GradientStop, GradientStopInput, GradientType,
} from './gradient.js'
