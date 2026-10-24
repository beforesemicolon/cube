import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, finite, scalarText } from '../../core/value.js'
import { state } from '../../core/runtime.js'
import { equalGuides, normalizeGuides, type ArtboardGuide, type ArtboardGuideOperation } from './guides.js'

export type { ArtboardGuide, ArtboardGuideOperation } from './guides.js'
export interface ArtboardGuidesDetail {
    readonly value: readonly ArtboardGuide[]
    readonly previousValue: readonly ArtboardGuide[]
    readonly guide: ArtboardGuide
    readonly operation: ArtboardGuideOperation
    readonly originalEvent?: Event
}
export interface ArtboardGuideEndDetail extends ArtboardGuidesDetail { readonly cancelled: boolean }

export interface ArtboardProps extends ComponentProps {
    width?: number
    height?: number
    background?: string
    selected?: boolean
    selectable?: boolean
    showDimensions?: boolean
    dimensionsLabel?: string
    name?: string
    editable?: boolean
    nameLabel?: string
    namePlaceholder?: string
    saveLabel?: string
    cancelLabel?: string
    resizable?: boolean
    minWidth?: number
    minHeight?: number
    resizeStep?: number
    resizeLabel?: string
    handleLabels?: Partial<Record<ArtboardResizeHandle, string>>
    guidesEnabled?: boolean
    showGuides?: boolean
    guides?: readonly ArtboardGuide[]
    horizontalGuideLabel?: string
    verticalGuideLabel?: string
    guideLabel?: string
    guideDistanceLabel?: string
}

export interface ArtboardSelectDetail { readonly selected: boolean; readonly originalEvent?: Event }
export interface ArtboardSize { readonly width: number; readonly height: number }
export type ArtboardResizeHandle = 'e' | 's' | 'se'
export interface ArtboardRenameDetail { readonly value: string; readonly previousValue: string; readonly originalEvent?: Event }
export interface ArtboardResizeDetail { readonly value: ArtboardSize; readonly previousValue: ArtboardSize; readonly originalEvent?: Event }

/** Headless behavior for a bounded, selectable document surface. */
export abstract class ArtboardBase extends Component<ArtboardProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'width', 'height', 'background', 'selected', 'selectable', 'show-dimensions', 'dimensions-label',
        'name', 'editable', 'name-label', 'name-placeholder', 'save-label', 'cancel-label', 'resizable',
        'min-width', 'min-height', 'resize-step', 'resize-label', 'handle-labels',
        'guides-enabled', 'show-guides', 'guides', 'horizontal-guide-label', 'vertical-guide-label', 'guide-label', 'guide-distance-label',
    ]

    width: number | undefined = undefined
    height: number | undefined = undefined
    background = ''
    selected = false
    selectable = true
    showDimensions = true
    dimensionsLabel = ''
    name = ''
    editable = true
    nameLabel = ''
    namePlaceholder = ''
    saveLabel = ''
    cancelLabel = ''
    resizable = true
    minWidth = 1
    minHeight = 1
    resizeStep = 1
    resizeLabel = ''
    handleLabels: Partial<Record<ArtboardResizeHandle, string>> = {}
    guidesEnabled = false
    showGuides = true
    guides: readonly ArtboardGuide[] = []
    horizontalGuideLabel = ''
    verticalGuideLabel = ''
    guideLabel = ''
    guideDistanceLabel = '{start}px · {end}px'
    protected readonly contentSize = state<ArtboardSize>({ width: 0, height: 0 })
    protected normalizedGuides = (): readonly ArtboardGuide[] => normalizeGuides(this.guides)
    protected guidesVisible = (): boolean => bool(this.guidesEnabled) && bool(this.showGuides, true)
    protected canEditGuides = (): boolean => this.guidesVisible() && !this.unavailable
    protected commitGuides = (value: readonly ArtboardGuide[], guide: ArtboardGuide, operation: ArtboardGuideOperation, originalEvent?: Event): boolean => {
        const previousValue = this.normalizedGuides(), next = normalizeGuides(value)
        if ((operation !== 'cancel' && !this.canEditGuides()) || equalGuides(previousValue, next)) return false
        const detail: ArtboardGuidesDetail = { value: next, previousValue, guide, operation, originalEvent }
        // Cancellation restores the transaction even if a consumer vetoes edits.
        if (operation !== 'cancel' && !this.request('beforeguideschange', detail)) return false
        this.guides = next
        this.emit('guideschange', detail)
        return true
    }

    protected explicitWidth = (): number => Math.max(0, finite(this.width))
    protected explicitHeight = (): number => Math.max(0, finite(this.height))
    protected artboardWidth = (): number => this.explicitWidth() || Math.max(1, this.contentSize[0]().width)
    protected artboardHeight = (): number => this.explicitHeight() || Math.max(1, this.contentSize[0]().height)
    protected accessibleName = (): string => scalarText(this.accessibleLabel) || scalarText(this.name) || scalarText(this.label)
    protected nameAccessibleName = (): string => scalarText(this.nameLabel) || this.accessibleName()
    protected nameActionLabel = (): string => [this.nameAccessibleName(), scalarText(this.name) || scalarText(this.namePlaceholder)].filter(Boolean).join(': ')
    protected canSelect(): boolean { return !this.unavailable && bool(this.selectable, true) }
    protected handlesVisible = (): boolean => !this.unavailable && bool(this.selected) && bool(this.resizable, true)
    protected dimensionsText = (): string => {
        return scalarText(this.dimensionsLabel).replace('{width}', String(Math.round(this.artboardWidth()))).replace('{height}', String(Math.round(this.artboardHeight())))
    }

    select(selected = true, originalEvent?: Event): boolean {
        if (!this.canSelect() || selected === bool(this.selected)) return false
        const detail: ArtboardSelectDetail = { selected, originalEvent }
        if (!this.request('beforeselect', detail)) return false
        this.selected = selected
        this.toggleAttribute('selected', selected)
        this.syncView()
        this.emit('select', detail)
        return true
    }

    rename = (value: string, originalEvent?: Event): boolean => {
        if (!this.requestRename(value, originalEvent)) return false
        this.commitRename(value, originalEvent)
        return true
    }
    protected requestRename = (value: string, originalEvent?: Event): boolean => {
        if (this.unavailable || !bool(this.editable, true) || scalarText(value) === scalarText(this.name)) return false
        return this.request('beforechange', this.renameDetail(value, originalEvent))
    }
    protected commitRename = (value: string, originalEvent?: Event): void => {
        const detail = this.renameDetail(value, originalEvent)
        this.name = detail.value
        this.emit('change', detail)
    }
    private renameDetail = (value: string, originalEvent?: Event): ArtboardRenameDetail => ({
        value: scalarText(value), previousValue: scalarText(this.name), originalEvent,
    })

    resize = (width: number, height: number, originalEvent?: Event): boolean => {
        if (this.unavailable || !bool(this.resizable, true)) return false
        const value: ArtboardSize = {
            width: Math.max(1, finite(this.minWidth, 1), finite(width, this.artboardWidth())),
            height: Math.max(1, finite(this.minHeight, 1), finite(height, this.artboardHeight())),
        }
        const previousValue: ArtboardSize = { width: this.artboardWidth(), height: this.artboardHeight() }
        if (value.width === previousValue.width && value.height === previousValue.height) return false
        const detail: ArtboardResizeDetail = { value, previousValue, originalEvent }
        if (!this.request('beforeresize', detail)) return false
        this.width = value.width
        this.height = value.height
        this.emit('resize', detail)
        return true
    }

    center = (originalEvent?: Event): boolean => {
        if (this.unavailable) return false
        const detail = { originalEvent }
        if (!this.request('beforecenter', detail)) return false
        this.emit('center', detail)
        return true
    }
}
