import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, finite, scalarText } from '../../core/value.js'

export interface ArtboardProps extends ComponentProps {
    width?: number
    height?: number
    background?: string
    selected?: boolean
    selectable?: boolean
    showDimensions?: boolean
    dimensionsLabel?: string
}

export interface ArtboardSelectDetail { readonly selected: boolean; readonly originalEvent?: Event }

/** Headless behavior for a bounded, selectable document surface. */
export abstract class ArtboardBase extends Component<ArtboardProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'width', 'height', 'background', 'selected', 'selectable', 'show-dimensions', 'dimensions-label',
    ]

    width = 640
    height = 400
    background = ''
    selected = false
    selectable = true
    showDimensions = true
    dimensionsLabel = ''

    protected artboardWidth(): number { return Math.max(1, finite(this.width, 640)) }
    protected artboardHeight(): number { return Math.max(1, finite(this.height, 400)) }
    protected canSelect(): boolean { return !this.unavailable && bool(this.selectable, true) }
    protected dimensionsText(): string {
        return scalarText(this.dimensionsLabel).replace('{width}', String(Math.round(this.artboardWidth()))).replace('{height}', String(Math.round(this.artboardHeight())))
    }

    select(selected = true, originalEvent?: Event): boolean {
        if (!this.canSelect()) return false
        const detail: ArtboardSelectDetail = { selected, originalEvent }
        if (!this.request('beforeselect', detail)) return false
        this.selected = selected
        this.toggleAttribute('selected', selected)
        this.syncView()
        this.emit('select', detail)
        return true
    }
}
