import { BoxBase, type BoxProps } from '../box/BoxBase.js'
import { bool, scalarText } from '../../core/value.js'

export type LayoutAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type LayoutDistribution = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
export type LayoutSpacing = '' | 'none' | 'apart' | 'around' | 'even' | 'stretch'
export type CollapsePoint = '' | 'sm' | 'md' | 'lg'

export interface RowProps extends BoxProps {
    align?: LayoutAlignment
    alignItems?: string
    justify?: LayoutDistribution
    alignSelf?: string
    spacing?: LayoutSpacing
    wrap?: boolean
    reverse?: boolean
    collapseAt?: CollapsePoint
}

const collapseWidths: Readonly<Record<Exclude<CollapsePoint, ''>, number>> = { sm: 480, md: 720, lg: 960 }

/** Horizontal layout behavior, including container-responsive stacking. */
export abstract class RowBase<P extends RowProps = RowProps> extends BoxBase<P> {
    static observedAttributes = [...BoxBase.observedAttributes, 'align', 'align-items', 'justify', 'align-self', 'spacing', 'wrap', 'reverse', 'collapse-at']
    align: LayoutAlignment = 'stretch'
    alignItems = ''
    justify: LayoutDistribution = 'start'
    alignSelf = ''
    spacing: LayoutSpacing = ''
    wrap = false
    reverse = false
    collapseAt: CollapsePoint = ''
    private observer?: ResizeObserver

    protected layoutOrientation(): 'row' | 'column' { return 'row' }

    protected syncLayout(): void {
        super.syncLayout()
        this.dataset.align = scalarText(this.align, 'stretch')
        const spacing: Readonly<Record<Exclude<LayoutSpacing, ''>, LayoutDistribution>> = {
            none: 'start', apart: 'space-between', around: 'space-around', even: 'space-evenly', stretch: 'space-between',
        }
        const legacy = this.spacing && this.spacing in spacing ? spacing[this.spacing as Exclude<LayoutSpacing, ''>] : undefined
        const main = legacy ?? scalarText(this.justify, 'start')
        this.dataset.justify = main
        const legacyAlignment = scalarText(this.alignItems).trim()
        if (legacyAlignment) this.applyLegacyAlignment(legacyAlignment)
        else {
            this.style.alignItems = ''
            this.style.justifyContent = ''
        }
        this.applySelfAlignment(scalarText(this.alignSelf))
        const gap = scalarText(this.gap)
        const gapScale: Readonly<Record<string, string>> = {
            none: '0', xs: 'var(--spacing-xs,4px)', s: 'var(--spacing-sm,8px)', sm: 'var(--spacing-sm,8px)',
            m: 'var(--spacing-md,12px)', md: 'var(--spacing-md,12px)', l: 'var(--spacing-lg,16px)',
            lg: 'var(--spacing-lg,16px)', xl: 'var(--spacing-xl,24px)', '2xl': 'var(--spacing-2xl,32px)', '3xl': 'var(--spacing-3xl,48px)',
        }
        this.style.gap = gap ? gapScale[gap] ?? gap : ''
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

    private applyLegacyAlignment(value: string): void {
        const [first = '', second = first] = value.split(',').map(token => token.trim().toLowerCase()).filter(Boolean)
        const orientation = this.layoutOrientation()
        let justify = 'auto'
        let align = 'auto'
        const applyHorizontal = (token: string): void => {
            const resolved = token === 'left' ? 'flex-start' : token === 'right' ? 'flex-end' : token === 'center' ? 'center' : token === 'stretch' ? 'stretch' : ''
            if (!resolved) return
            if (orientation === 'row' && resolved !== 'stretch') justify = resolved
            else align = resolved
        }
        const applyVertical = (token: string): void => {
            const resolved = token === 'top' ? 'flex-start' : token === 'bottom' ? 'flex-end' : token === 'center' ? 'center' : token === 'stretch' ? 'stretch' : ''
            if (!resolved) return
            if (orientation === 'row') align = resolved
            else if (resolved !== 'stretch') justify = resolved
        }
        applyHorizontal(first)
        applyVertical(second)
        this.style.justifyContent = justify
        this.style.alignItems = align
    }

    private applySelfAlignment(value: string): void {
        const [horizontal = '', vertical = horizontal] = value.split(',').map(token => token.trim().toLowerCase()).filter(Boolean)
        this.style.alignSelf = horizontal === 'stretch' || vertical === 'stretch' ? 'stretch' : 'auto'
        this.style.marginInlineStart = horizontal === 'right' || horizontal === 'center' ? 'auto' : ''
        this.style.marginInlineEnd = horizontal === 'left' || horizontal === 'center' ? 'auto' : ''
        this.style.marginBlockStart = vertical === 'bottom' || vertical === 'center' ? 'auto' : ''
        this.style.marginBlockEnd = vertical === 'top' || vertical === 'center' ? 'auto' : ''
    }
}
