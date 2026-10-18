import { BoxBase, type BoxProps } from '../box/BoxBase.js'
import { bool, scalarText } from '../../core/value.js'

export type LayoutAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type LayoutDistribution = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
export type CollapsePoint = '' | 'sm' | 'md' | 'lg'

export interface RowProps extends BoxProps {
    align?: LayoutAlignment
    justify?: LayoutDistribution
    wrap?: boolean
    reverse?: boolean
    collapseAt?: CollapsePoint
}

const collapseWidths: Readonly<Record<Exclude<CollapsePoint, ''>, number>> = { sm: 480, md: 720, lg: 960 }

/** Horizontal layout behavior, including container-responsive stacking. */
export abstract class RowBase<P extends RowProps = RowProps> extends BoxBase<P> {
    static observedAttributes = [...BoxBase.observedAttributes, 'align', 'justify', 'wrap', 'reverse', 'collapse-at']
    align: LayoutAlignment = 'stretch'
    justify: LayoutDistribution = 'start'
    wrap = false
    reverse = false
    collapseAt: CollapsePoint = ''
    private observer?: ResizeObserver

    protected syncLayout(): void {
        super.syncLayout()
        this.dataset.align = scalarText(this.align, 'stretch')
        this.dataset.justify = scalarText(this.justify, 'start')
        this.toggleAttribute('data-wrap', bool(this.wrap))
        this.toggleAttribute('data-reverse', bool(this.reverse))
        this.syncResponsive()
    }

    protected mount(): void {
        super.mount()
        if (typeof ResizeObserver !== 'undefined') {
            this.observer = new ResizeObserver(() => this.syncResponsive())
            this.observer.observe(this)
            this.cleanup(() => this.observer?.disconnect())
        }
    }

    private syncResponsive(): void {
        const point = this.collapseAt
        this.toggleAttribute('data-collapsed', point !== '' && this.getBoundingClientRect().width <= collapseWidths[point])
    }
}
