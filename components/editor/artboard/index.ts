import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, or, when, html, repeat, state, type Template } from '../../core/runtime.js'

import { bool, finite, scalarText } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import { ArtboardBase, type ArtboardResizeHandle, type ArtboardRenameDetail } from './ArtboardBase.js'
import { uid } from '../../core/id.js'
import { guideDistances, snapGuide, type ArtboardGuide, type ArtboardGuideOperation } from './guides.js'
import type { EditorGuide } from '../guide-overlay/base.js'
import type { ArtboardPreviewPreset } from './preview.js'
import { SelectionControlsController } from '../selection-overlay/controls.js'

const handles: readonly ArtboardResizeHandle[] = ['e', 's', 'se']
const edges = ['n', 'e', 's', 'w'] as const
type ResizeDirection = ArtboardResizeHandle | typeof edges[number]

export class Artboard extends ArtboardBase {
    stylesheet = componentStylesheet
    private observer?: ResizeObserver
    private previewController?: SelectionControlsController
    private previewElement?: HTMLElement
    private previewSyncPending = false
    private measureFrame?: number
    private releaseResize?: () => void
    private nameCenterTimer?: number
    private releaseGuide?: (cancel: boolean, event?: Event) => void
    private suppressGuideClick = false
    private readonly embeddedFrames = new Map<HTMLIFrameElement, { readonly document: Document | null; readonly dispose: () => void }>()
    private readonly highlightedGuide = state('')
    private readonly guideScale = state({ x: 1, y: 1 })

    private get frame(): HTMLElement | undefined {
        const node = this.refs.frame?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private get content(): HTMLElement | undefined {
        const node = this.refs.content?.[0]
        return node instanceof HTMLElement ? node : undefined
    }

    render(): Template {
        return html`<div ref="frame" part="frame canvas canvas-marker control" role="region"
            style=${this.frameStyle} data-selected=${() => bool(this.selected) ? '' : null} data-viewport-sizing=${() => bool(this.viewportSizing) ? '' : null}
            tabindex=${() => this.canSelect() ? 0 : -1} aria-label=${this.accessibleName}
            aria-disabled=${() => this.unavailable ? 'true' : null}
            aria-current=${() => this.canSelect() && bool(this.selected) ? 'true' : null}
            onpointerenter=${this.measureGuideScale} onpointerdown=${[this.clearGuideClick, true]}
            onclick=${[this.selectFrame, true]} onkeydown=${this.selectKey} ondblclick=${this.centerFrame}>
            ${when(this.props.showPreviewControls, this.previewControls())}
            <div ref="header" part="header" onpointerdown=${this.containEvent} onclick=${this.containEvent} ondblclick=${this.containEvent} onkeydown=${this.containEvent}>
                ${when(this.props.editable, html`<cb-editable-label ref="name" part="name" value=${this.props.name} label=${this.nameAccessibleName}
                edit-label=${this.nameActionLabel} empty-label=${this.props.namePlaceholder}
                placeholder=${this.props.namePlaceholder} save-label=${this.props.saveLabel} cancel-label=${this.props.cancelLabel}
                read-only=${isNot(this.props.editable)} disabled=${() => this.unavailable}
                onbeforechange=${this.beforeRename} onchange=${this.nameChanged}
                onbeforeedit=${this.beforeNameEdit} oneditstart=${this.containEvent}
                onbeforeeditcancel=${this.containEvent} oneditend=${this.containEvent}
                onclick=${this.containEvent} ondblclick=${this.containEvent} onkeydown=${this.containEvent}></cb-editable-label>`, html`<cb-button ref="name" part="name name-select" variant="ghost" label=${this.props.name}
                    icon=${this.props.nameIcon} accessible-label=${this.nameActionLabel} disabled=${() => !this.canSelect()}
                    onaction=${this.activateHeader} ondblclick=${this.openHeader}><span part="name-label">${this.props.name}</span>${when(this.props.nameDescription, html`<span slot="suffix" part="name-description">${this.props.nameDescription}</span>`)}</cb-button>`)}
                ${when(() => this.editable && this.nameDescription, html`<span part="name-description">${this.props.nameDescription}</span>`)}
                <slot name="header-actions" part="header-actions"></slot>
            </div>
            <div part="content-viewport" data-device=${() => this.previewMode === 'device' ? '' : null}><div ref="content" part="content" style=${this.contentStyle} onslotchange=${this.contentChanged}>
                <slot ref="slot"></slot>
            </div></div>
            <div ref="guides" part="guide-layer" style=${this.guideLayerStyle} hidden=${isNot(this.guidesVisible)}
                onpointerenter=${this.measureGuideScale} ondblclick=${this.containEvent}>
                ${when(this.guidesVisible, html`<cb-guide-overlay part="guide-overlay" guides=${this.visualGuides} zoom="1"
                    exportparts="line:guide-line,label:guide-distance"></cb-guide-overlay>`)}
                ${repeat(this.visibleGuides, guide => html`<cb-button part="guide-handle" data-guide-id=${guide.id}
                    data-bare data-semantic-host role="slider" style=${() => this.guideHandleStyle(guide)}
                    disabled=${() => !this.canEditGuides()} accessible-label=${() => this.guideName(guide)}
                    aria-orientation=${guide.axis === 'y' ? 'horizontal' : 'vertical'}
                    aria-valuemin="0" aria-valuemax=${() => this.guideExtent(guide.axis)} aria-valuenow=${guide.position}
                    aria-valuetext=${() => this.distanceText(guide)}
                    onpointerdown=${(event: PointerEvent) => this.beginGuide(guide.axis, guide.id, event)}
                    onpointerenter=${() => this.highlightedGuide[1](guide.id)} onpointerleave=${this.leaveGuide}
                    onfocus=${() => this.highlightedGuide[1](guide.id)} onblur=${this.leaveGuide}
                    onkeydown=${(event: KeyboardEvent) => this.guideKey(guide, event)}
                    onclick=${this.containEvent} onbeforeaction=${this.containEvent} onaction=${this.containEvent}></cb-button>`, { key: guide => guide.id })}
                ${repeat(['x', 'y'] as const, axis => html`<cb-button part=${`guide-edge ${axis === 'x' ? 'guide-top' : 'guide-left'}`}
                    data-bare data-semantic-host disabled=${() => !this.canEditGuides()}
                    accessible-label=${axis === 'x' ? this.props.horizontalGuideLabel : this.props.verticalGuideLabel}
                    onpointerdown=${(event: PointerEvent) => this.beginGuide(axis, undefined, event)}
                    onfocus=${this.measureGuideScale} onclick=${this.containEvent} onbeforeaction=${this.containEvent}
                    onaction=${(event: CustomEvent<{ originalEvent?: Event }>) => this.createGuideKey(axis, event)}></cb-button>`)}
            </div>
            <output part="dimensions" hidden=${or(isNot(this.props.showDimensions), isNot(this.dimensionsText))}>${this.dimensionsText}</output>
            ${repeat(edges, edge => html`<div part=${`selection-edge selection-edge-${edge}`}
                data-resizable=${() => this.handlesVisible() ? '' : null}
                onpointerdown=${(event: PointerEvent) => { if (this.handlesVisible()) this.beginResize(edge, event) }}
                aria-hidden="true" hidden=${isNot(or(() => this.canSelect(), this.handlesVisible))}></div>`)}
            ${repeat(() => this.handlesVisible() ? handles : [], handle => html`<cb-button ref="resizeHandles" part=${`resize-handle handle-${handle}`} data-handle=${handle}
                data-bare data-semantic-host hidden=${isNot(this.handlesVisible)} disabled=${() => this.unavailable}
                accessible-label=${() => this.handleLabel(handle)} onbeforeaction=${this.containEvent} onaction=${this.containEvent}
                onclick=${this.containEvent} onpointerdown=${(event: PointerEvent) => this.beginResize(handle, event)}
                onkeydown=${(event: KeyboardEvent) => this.resizeKey(handle, event)}></cb-button>`, { key: handle => handle })}
        </div>`
    }
    private activateHeader = (event: Event): void => {
        event.stopPropagation()
        if (!this.canSelect() || !bool(this.selected) && !this.select(true, event)) return
        this.emit('headeractivate', { originalEvent: event })
    }
    private openHeader = (event: MouseEvent): void => {
        event.stopPropagation()
        if (!this.canSelect() || !bool(this.selected) && !this.select(true, event)) return
        this.emit('headerdoubleactivate', { originalEvent: event })
    }
    private previewChoices = (): readonly ArtboardPreviewPreset[] => this.previewPresets.filter(preset =>
        preset.id && Number.isFinite(preset.width) && preset.width >= 1 && Number.isFinite(preset.height) && preset.height >= 1)
    private previewCategory = (): string => this.previewMode === 'device' ? this.previewChoices().find(preset => preset.id === this.previewPresetId)?.category || '' : ''
    private choosePreview = (id: string, event: Event): void => {
        const preset = this.previewChoices().find(item => item.id === id)
        if (!preset && id !== 'default') return
        if (preset && this.previewMode !== 'device') this.previewDefaultSize = { width: this.artboardWidth(), height: this.artboardHeight() }
        const base = this.previewDefaultSize
        this.setPreview({ ...this.previewValue(), mode: preset ? 'device' : 'width', presetId: preset?.id || 'default',
            width: preset?.width || base?.width || this.artboardWidth(), height: preset?.height || base?.height || this.artboardHeight() }, event)
    }
    private previewControls = (): Template => html`<div ref="previewControls" part="preview-controls" role="group" aria-label=${() => this.previewLabels.controls || ''}
        popover="manual" hidden onpointerdown=${this.containEvent} onclick=${this.containEvent} ondblclick=${this.containEvent} onkeydown=${this.containEvent}>
        <div part="preview-row">
            <cb-select accessible-label=${() => this.previewLabels.presets || ''}
                value=${() => this.previewChoices().some(preset => preset.id === this.previewPresetId) ? this.previewPresetId : 'default'}
                options=${() => [{ value: 'default', label: this.previewLabels.default || 'Artboard' }, ...this.previewChoices().map(preset => ({ value: preset.id, label: `${preset.label} · ${preset.width} × ${preset.height}` }))]}
                size="sm" disabled=${() => this.unavailable} onchange=${(event: CustomEvent<{ value: string }>) => { event.stopPropagation(); this.choosePreview(event.detail.value, event) }}></cb-select>
            <cb-segmented-control accessible-label=${() => this.previewLabels.size || ''} value=${this.previewCategory} icon-only="true" size="sm" allow-empty="true"
                items=${() => (['mobile', 'tablet', 'desktop'] as const).map(id => ({ id, icon: id, label: this.previewLabels[id] || id, disabled: !this.previewChoices().some(preset => preset.category === id) }))}
                disabled=${() => this.unavailable} onchange=${(event: CustomEvent<{ value: string }>) => {
                    event.stopPropagation(); const id = this.previewChoices().find(item => item.category === event.detail.value)?.id; if (id || !event.detail.value) this.choosePreview(id || 'default', event)
                }}></cb-segmented-control>
        </div>
        <slot name="preview-description"></slot>
    </div>`
    private frameStyle = (): string => {
        const size = this.contentSize[0]()
        const width = this.explicitWidth() || size.width
        const height = this.explicitHeight() || size.height
        const background = scalarText(this.background)
        return `inline-size:${width ? width + 'px' : 'max-content'};block-size:${height ? height + 'px' : 'auto'};background:${CSS.supports('background', background) ? background : v('--color-surface')}`
    }
    private contentStyle = (): string => `inline-size:${this.explicitWidth() ? '100%' : 'max-content'};block-size:${this.explicitHeight() ? '100%' : 'auto'}`
    private containEvent = (event: Event): void => { event.stopPropagation() }
    private visibleGuides = (): readonly ArtboardGuide[] => this.guidesVisible()
        ? this.normalizedGuides().filter(guide => guide.position <= this.guideExtent(guide.axis)) : []
    private guideExtent = (axis: ArtboardGuide['axis']): number => axis === 'y' ? this.artboardWidth() : this.artboardHeight()
    private guideName = (guide: ArtboardGuide): string => (scalarText(this.guideLabel) || `${this.accessibleName()} {id}`)
        .replaceAll('{id}', guide.id).replaceAll('{axis}', guide.axis).replaceAll('{position}', String(guide.position))
    private distanceText = (guide: ArtboardGuide): string => {
        const distances = guideDistances(guide, this.artboardWidth(), this.artboardHeight())
        return scalarText(this.guideDistanceLabel).replaceAll('{start}', String(Math.round(distances.start * 100) / 100))
            .replaceAll('{end}', String(Math.round(distances.end * 100) / 100))
    }
    private visualGuides = (): readonly EditorGuide[] => this.visibleGuides().map(guide => ({
        ...guide, start: 0, end: guide.axis === 'y' ? this.artboardHeight() : this.artboardWidth(),
        label: this.highlightedGuide[0]() === guide.id ? this.distanceText(guide) : '', type: 'snap',
    }))
    private guideLayerStyle = (): string => {
        const scale = this.guideScale[0]()
        return `inline-size:${this.artboardWidth()}px;block-size:${this.artboardHeight()}px;--guide-hit-x:${10 / scale.x}px;--guide-hit-y:${10 / scale.y}px`
    }
    private guideHandleStyle = (guide: ArtboardGuide): string => guide.axis === 'y'
        ? `inset-inline-start:${guide.position}px;inset-block-start:0;inline-size:var(--guide-hit-x);block-size:100%;translate:-50% 0;cursor:ew-resize`
        : `inset-block-start:${guide.position}px;inset-inline-start:0;block-size:var(--guide-hit-y);inline-size:100%;translate:0 -50%;cursor:ns-resize`
    private measureGuideScale = (): void => {
        const frame = this.frame
        if (!frame) return
        const bounds = frame.getBoundingClientRect()
        const next = { x: Math.max(.01, bounds.width / frame.offsetWidth), y: Math.max(.01, bounds.height / frame.offsetHeight) }
        const previous = this.guideScale[0]()
        if (next.x !== previous.x || next.y !== previous.y) this.guideScale[1](next)
    }
    private leaveGuide = (): void => { if (!this.releaseGuide) this.highlightedGuide[1]('') }
    private endGuide = (previousValue: readonly ArtboardGuide[], guide: ArtboardGuide, operation: ArtboardGuideOperation, cancelled: boolean, originalEvent?: Event): void => {
        this.emit('guideend', { value: this.normalizedGuides(), previousValue, guide, operation, cancelled, originalEvent })
    }
    private editGuide = (guide: ArtboardGuide, operation: 'create' | 'move' | 'remove', event: Event): boolean => {
        const current = this.normalizedGuides()
        const value = operation === 'remove' ? current.filter(item => item.id !== guide.id)
            : current.some(item => item.id === guide.id) ? current.map(item => item.id === guide.id ? guide : item) : [...current, guide]
        return this.commitGuides(value, guide, operation, event)
    }
    private createGuideKey = (axis: ArtboardGuide['axis'], event: CustomEvent<{ originalEvent?: Event }>): void => {
        event.stopPropagation()
        const source = event.detail.originalEvent
        if (!this.canEditGuides() || source instanceof MouseEvent && source.detail > 0) return
        const previous = this.normalizedGuides()
        const guide: ArtboardGuide = { id: uid('guide'), axis, position: this.guideExtent(axis) / 2 }
        if (this.editGuide(guide, 'create', source ?? event)) this.endGuide(previous, guide, 'create', false, source ?? event)
    }
    private guideKey = (guide: ArtboardGuide, event: KeyboardEvent): void => {
        event.stopPropagation()
        if (!this.canEditGuides()) return
        const previous = this.normalizedGuides(), extent = this.guideExtent(guide.axis)
        const step = event.shiftKey ? 10 : 1
        const negative = guide.axis === 'y' ? 'ArrowLeft' : 'ArrowUp', positive = guide.axis === 'y' ? 'ArrowRight' : 'ArrowDown'
        if (![negative, positive, 'Home', 'End', 'Delete', 'Backspace'].includes(event.key)) return
        event.preventDefault()
        const remove = ['Delete', 'Backspace'].includes(event.key)
        const position = event.key === 'Home' ? 0 : event.key === 'End' ? extent : Math.max(0, Math.min(extent, guide.position + (event.key === negative ? -step : step)))
        const next = { ...guide, position }
        if (this.editGuide(next, remove ? 'remove' : 'move', event)) this.endGuide(previous, next, remove ? 'remove' : 'move', false, event)
    }
    private beginGuide = (axis: ArtboardGuide['axis'], id: string | undefined, event: PointerEvent): void => {
        if (!this.canEditGuides() || event.button !== 0) return
        const target = event.currentTarget, frame = this.frame
        if (!(target instanceof HTMLElement) || !frame) return
        event.preventDefault(); event.stopPropagation()
        this.suppressGuideClick = true
        this.releaseGuide?.(true, event)
        this.releaseResize?.()
        this.measureGuideScale()
        const previous = this.normalizedGuides(), existing = previous.find(guide => guide.id === id)
        let guide: ArtboardGuide = existing ?? { id: uid('guide'), axis, position: 0 }
        let changed = false, moved = false, outside = false
        const operation = existing ? 'move' : 'create'
        this.highlightedGuide[1](guide.id)
        target.setPointerCapture(event.pointerId)
        const move = (next: PointerEvent): void => {
            if (next.pointerId !== event.pointerId || !this.canEditGuides()) return
            if (!moved && Math.hypot(next.clientX - event.clientX, next.clientY - event.clientY) < 3) return
            moved = true
            this.measureGuideScale()
            const bounds = frame.getBoundingClientRect(), scale = this.guideScale[0]()
            const raw = axis === 'y' ? (next.clientX - bounds.left) / scale.x : (next.clientY - bounds.top) / scale.y
            outside = raw < -6 / (axis === 'y' ? scale.x : scale.y) || raw > this.guideExtent(axis) + 6 / (axis === 'y' ? scale.x : scale.y)
            if (outside) return
            guide = { ...guide, position: snapGuide(raw, this.guideExtent(axis), axis === 'y' ? scale.x : scale.y, this.normalizedGuides(), guide) }
            changed = this.editGuide(guide, operation, next) || changed
        }
        const finish = (cancel: boolean, source?: Event): void => {
            target.removeEventListener('pointermove', move)
            target.removeEventListener('pointerup', up)
            target.removeEventListener('pointercancel', cancelPointer)
            target.removeEventListener('lostpointercapture', cancelPointer)
            this.ownerDocument.removeEventListener('keydown', escape, true)
            this.releaseGuide = undefined
            if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
            if (cancel && changed) this.commitGuides(previous, guide, 'cancel', source)
            else if (!cancel && moved && outside) changed = this.editGuide(guide, 'remove', source ?? event) || changed
            if (changed) this.endGuide(previous, guide, cancel ? 'cancel' : outside && !this.normalizedGuides().some(item => item.id === guide.id) ? 'remove' : operation, cancel, source)
            this.highlightedGuide[1]('')
        }
        const up = (next: PointerEvent): void => { if (next.pointerId === event.pointerId) { move(next); finish(false, next) } }
        const cancelPointer = (next: PointerEvent): void => { if (next.pointerId === event.pointerId) finish(true, next) }
        const escape = (next: KeyboardEvent): void => { if (next.key === 'Escape') { next.preventDefault(); next.stopImmediatePropagation(); finish(true, next) } }
        this.releaseGuide = finish
        target.addEventListener('pointermove', move)
        target.addEventListener('pointerup', up)
        target.addEventListener('pointercancel', cancelPointer)
        target.addEventListener('lostpointercapture', cancelPointer)
        this.ownerDocument.addEventListener('keydown', escape, true)
    }
    private clearGuideClick = (): void => { this.suppressGuideClick = false }
    private selectFrame = (event: Event): void => {
        const path = event.composedPath()
        if (path.find(node => node instanceof HTMLElement && node.localName === 'cb-artboard') !== this) return
        // Capture content clicks before consumer controls stop propagation, while
        // leaving the artboard's title editor and editing chrome in charge of their gestures.
        if (['header', 'guides', 'resizeHandles', 'previewControls'].some(ref => this.refs[ref]?.some(node => path.includes(node)))) return
        // A cancelled drag releases capture before pointerup; its synthesized
        // click may target the frame instead of the original guide control.
        if (this.suppressGuideClick) { this.suppressGuideClick = false; event.preventDefault(); event.stopPropagation(); return }
        this.select(true, event)
    }
    private selectKey = (event: KeyboardEvent): void => {
        if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return
        event.preventDefault()
        this.select(true, event)
    }
    private centerFrame = (event: MouseEvent): void => {
        event.stopPropagation()
        event.preventDefault()
        this.center(event)
    }
    private cancelNameCenter = (): void => {
        if (this.nameCenterTimer !== undefined) this.ownerDocument.defaultView?.clearTimeout(this.nameCenterTimer)
        this.nameCenterTimer = undefined
    }
    private beforeNameEdit = (event: CustomEvent<{ readonly originalEvent?: Event }>): void => {
        event.stopPropagation()
        const source = event.detail.originalEvent
        const original = source instanceof CustomEvent ? (source as CustomEvent<{ readonly originalEvent?: Event }>).detail.originalEvent : source
        this.cancelNameCenter()
        if (!original || original instanceof KeyboardEvent && original.key === 'F2') return
        if (original instanceof MouseEvent && original.detail >= 2) return
        event.preventDefault()
        this.select(true, original)
        if (original instanceof MouseEvent && original.detail > 0) {
            // Keep the title still until a second click can start editing.
            this.nameCenterTimer = this.ownerDocument.defaultView?.setTimeout(() => {
                this.nameCenterTimer = undefined
                this.center(original)
            }, 300)
        } else this.center(original)
    }
    private beforeRename = (event: CustomEvent<ArtboardRenameDetail>): void => {
        event.stopPropagation()
        if (!this.requestRename(event.detail.value, event.detail.originalEvent)) event.preventDefault()
    }
    private nameChanged = (event: CustomEvent<ArtboardRenameDetail>): void => {
        event.stopPropagation()
        this.commitRename(event.detail.value, event.detail.originalEvent)
    }
    private handleLabel = (handle: ArtboardResizeHandle): string => (scalarText(this.resizeLabel) || this.accessibleName()).replaceAll('{handle}', scalarText(this.handleLabels[handle], handle))

    protected mount(): void {
        super.mount()
        this.syncPreviewControls()
        this.observer = new ResizeObserver(this.scheduleMeasure)
        const mutations = new MutationObserver(records => {
            if (records.some(record => record.target !== this || record.type !== 'attributes')) this.contentChanged()
        })
        mutations.observe(this, { childList: true, subtree: true, characterData: true, attributes: true })
        this.addEventListener('load', this.contentChanged, true)
        this.cleanup(() => {
            this.cancelNameCenter()
            this.previewController?.dispose()
            this.previewController = undefined
            this.previewElement = undefined
            this.observer?.disconnect()
            mutations.disconnect()
            this.removeEventListener('load', this.contentChanged, true)
            if (this.measureFrame !== undefined) this.ownerDocument.defaultView?.cancelAnimationFrame(this.measureFrame)
            this.measureFrame = undefined
            this.releaseResize?.()
            this.releaseGuide?.(true)
        })
        this.contentChanged()
        const view = this.ownerDocument.defaultView
        if (view) this.listen(view, 'blur', this.selectFocusedFrame)
        this.cleanup(() => {
            for (const frame of this.embeddedFrames.values()) frame.dispose()
            this.embeddedFrames.clear()
        })
    }
    private syncPreviewControls = (): void => {
        if (this.previewSyncPending) return
        this.previewSyncPending = true
        queueMicrotask(() => {
            this.previewSyncPending = false
            if (!this.isConnected) return
            const controls = this.refs.previewControls?.find(node => node instanceof HTMLElement && node.isConnected)
            if (controls !== this.previewElement) {
                this.previewController?.dispose()
                this.previewElement = controls instanceof HTMLElement ? controls : undefined
                this.previewController = this.previewElement ? new SelectionControlsController(this, this.previewElement, () => bool(this.showPreviewControls), () => 48, true) : undefined
            }
            this.previewController?.refresh()
        })
    }
    protected syncView(): void { this.syncPreviewControls() }
    protected update(name: string): void {
        super.update(name)
        if (['width', 'height'].includes(name)) this.scheduleMeasure()
        if (['disabled', 'guidesEnabled', 'showGuides'].includes(name) && !this.canEditGuides()) this.releaseGuide?.(true)
    }
    private contentChanged = (): void => {
        this.observer?.disconnect()
        if (this.content) this.observer?.observe(this.content)
        const elements = this.contentElements()
        for (const element of elements) this.observer?.observe(element)
        this.syncEmbeddedFrames(elements)
        this.scheduleMeasure()
    }
    private syncEmbeddedFrames = (elements: readonly HTMLElement[]): void => {
        const frames = new Set(elements.filter((element): element is HTMLIFrameElement =>
            element instanceof HTMLIFrameElement && element.closest('cb-artboard') === this))
        for (const [frame, binding] of this.embeddedFrames) {
            if (frames.has(frame) && frame.contentDocument === binding.document) continue
            binding.dispose()
            this.embeddedFrames.delete(frame)
        }
        for (const frame of frames) {
            if (this.embeddedFrames.has(frame)) continue
            const doc = frame.contentDocument
            const select = (event: MouseEvent): void => { this.select(true, event) }
            doc?.addEventListener('click', select, true)
            this.embeddedFrames.set(frame, { document: doc, dispose: () => doc?.removeEventListener('click', select, true) })
        }
    }
    private selectFocusedFrame = (event: Event): void => {
        queueMicrotask(() => {
            if (!this.mounted || !this.ownerDocument.hasFocus()) return
            let focused = this.ownerDocument.activeElement
            while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement
            // Cross-origin frames cannot forward DOM clicks. Native focus transfer
            // still identifies the owned frame without reading its document or blocking it.
            if (focused instanceof HTMLIFrameElement && this.embeddedFrames.get(focused)?.document === null) this.select(true, event)
        })
    }
    private contentElements = (): HTMLElement[] => {
        const elements: HTMLElement[] = []
        const walker = this.ownerDocument.createTreeWalker(this, NodeFilter.SHOW_ELEMENT)
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node instanceof HTMLElement) elements.push(node)
        }
        return elements
    }
    private scheduleMeasure = (): void => {
        const window = this.ownerDocument.defaultView
        if (!window || this.measureFrame !== undefined || !this.isConnected) return
        this.measureFrame = window.requestAnimationFrame(() => {
            this.measureFrame = undefined
            this.measureContent()
        })
    }
    private measureContent = (): void => {
        const content = this.content, frame = this.frame
        if (!content || !frame) return
        const bounds = content.getBoundingClientRect()
        const scaleX = content.offsetWidth ? bounds.width / content.offsetWidth : 1
        const scaleY = content.offsetHeight ? bounds.height / content.offsetHeight : 1
        let width = Math.max(content.offsetWidth, content.scrollWidth)
        let height = Math.max(content.offsetHeight, content.scrollHeight)
        for (const element of this.contentElements()) {
            if (!element.getClientRects().length) continue
            const rect = element.getBoundingClientRect()
            width = Math.max(width, (rect.left - bounds.left) / (scaleX || 1) + Math.max(element.offsetWidth, element.scrollWidth))
            height = Math.max(height, (rect.top - bounds.top) / (scaleY || 1) + Math.max(element.offsetHeight, element.scrollHeight))
        }
        // Transformed bounds can contain tiny floating-point errors; they must
        // not change the document size when only viewport zoom changes.
        const next = { width: Math.ceil(width - .001) + (bool(this.viewportSizing) ? 0 : frame.offsetWidth - frame.clientWidth), height: Math.ceil(height - .001) + (bool(this.viewportSizing) ? 0 : frame.offsetHeight - frame.clientHeight) }
        const previous = this.contentSize[0]()
        if (next.width !== previous.width || next.height !== previous.height) this.contentSize[1](next)
    }
    private beginResize = (handle: ResizeDirection, event: PointerEvent): void => {
        event.stopPropagation()
        const button = event.currentTarget, frame = this.frame
        if (!(button instanceof HTMLElement) || !frame || event.button !== 0 || !this.handlesVisible()) return
        event.preventDefault()
        this.releaseResize?.()
        const bounds = frame.getBoundingClientRect()
        const scaleX = bounds.width / frame.offsetWidth || 1, scaleY = bounds.height / frame.offsetHeight || 1
        const initialWidth = this.artboardWidth(), initialHeight = this.artboardHeight()
        const startX = event.clientX, startY = event.clientY
        const horizontal = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0
        const vertical = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0
        button.setPointerCapture(event.pointerId)
        const move = (next: PointerEvent): void => {
            if (next.pointerId !== event.pointerId || !this.handlesVisible()) return
            this.resize(initialWidth + horizontal * (next.clientX - startX) / scaleX,
                initialHeight + vertical * (next.clientY - startY) / scaleY, next)
        }
        const release = (): void => {
            button.removeEventListener('pointermove', move)
            button.removeEventListener('pointerup', release)
            button.removeEventListener('pointercancel', release)
            button.removeEventListener('lostpointercapture', release)
            if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId)
            this.releaseResize = undefined
        }
        this.releaseResize = release
        button.addEventListener('pointermove', move)
        button.addEventListener('pointerup', release)
        button.addEventListener('pointercancel', release)
        button.addEventListener('lostpointercapture', release)
    }
    private resizeKey = (handle: ArtboardResizeHandle, event: KeyboardEvent): void => {
        event.stopPropagation()
        if (!this.handlesVisible() || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
        event.preventDefault()
        const step = Math.max(1, finite(this.resizeStep, 1)) * (event.shiftKey ? 10 : 1)
        const dx = handle.includes('e') ? (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0) : 0
        const dy = handle.includes('s') ? (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0) : 0
        if (dx || dy) this.resize(this.artboardWidth() + dx, this.artboardHeight() + dy, event)
    }
}
export { ArtboardBase };
export type { ArtboardPreviewMode, ArtboardPreviewPreset, ArtboardPreviewLabels, ArtboardPreviewValue, ArtboardPreviewDetail } from './preview.js';
export type { ArtboardProps, ArtboardSize, ArtboardResizeHandle, ArtboardRenameDetail, ArtboardResizeDetail, ArtboardSelectDetail,
    ArtboardGuide, ArtboardGuideOperation, ArtboardGuidesDetail, ArtboardGuideEndDetail } from './ArtboardBase.js';

register('cb-artboard', Artboard)
