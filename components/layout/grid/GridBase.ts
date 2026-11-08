import { BoxBase, layoutSpacing, type BoxProps } from '../box/BoxBase.js'
import { bool, scalarText } from '../../core/value.js'

export interface GridProps extends BoxProps {
    empty?: boolean
    variant?:
        | ''
        | 'cards'
        | 'masonry'
        | 'holy-grail'
        | 'sidebar'
        | 'header-main-footer'
    columns?: string
    rows?: string
    template?: string
    templateColumns?: string
    templateCols?: string
    templateRows?: string
    templateAreas?: string
    autoColumns?: string
    autoCols?: string
    autoRows?: string
    autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
    area?: string
    align?: string
    justify?: string
    alignContent?: string
    justifyContent?: string
    columnGap?: string
    rowGap?: string
}

/** Grid track behavior without imposing child markup. */
export abstract class GridBase<
    P extends GridProps = GridProps,
> extends BoxBase<P> {
    static observedAttributes = [
        ...BoxBase.observedAttributes,
        'empty',
        'variant',
        'columns',
        'rows',
        'template',
        'template-columns',
        'template-cols',
        'template-rows',
        'template-areas',
        'auto-columns',
        'auto-cols',
        'auto-rows',
        'auto-flow',
        'area',
        'align',
        'justify',
        'align-content',
        'justify-content',
        'column-gap',
        'row-gap',
    ]
    empty = false
    variant: GridProps['variant'] = ''
    columns = 'minmax(0, 1fr)'
    rows = ''
    template = ''
    templateColumns = ''
    templateCols = ''
    templateRows = ''
    templateAreas = ''
    autoColumns = ''
    autoCols = ''
    autoRows = ''
    autoFlow: GridProps['autoFlow'] = 'row'
    area = ''
    align = 'stretch'
    justify = 'stretch'
    alignContent = ''
    justifyContent = ''
    columnGap = ''
    rowGap = ''

    protected syncLayout(): void {
        super.syncLayout()
        const variant = this.variant ?? ''
        const variantColumns: Readonly<
            Record<Exclude<GridProps['variant'], undefined | ''>, string>
        > = {
            cards: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
            masonry: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
            'holy-grail': 'minmax(180px,auto) minmax(0,1fr) minmax(180px,auto)',
            sidebar: 'minmax(220px,auto) minmax(0,1fr)',
            'header-main-footer': 'minmax(0,1fr)',
        }
        const variantRows: Readonly<
            Record<Exclude<GridProps['variant'], undefined | ''>, string>
        > = {
            cards: '',
            masonry: '',
            'holy-grail': 'auto minmax(0,1fr) auto',
            sidebar: 'minmax(0,1fr)',
            'header-main-footer': 'auto minmax(0,1fr) auto',
        }
        this.dataset.variant = variant
        this.style.gridTemplate = scalarText(this.template)
        this.style.gridTemplateColumns =
            scalarText(this.templateColumns) ||
            scalarText(this.templateCols) ||
            scalarText(this.columns) ||
            (variant ? variantColumns[variant] : '') ||
            'minmax(0, 1fr)'
        this.style.gridTemplateRows =
            scalarText(this.templateRows) || scalarText(this.rows)
        if (!scalarText(this.templateRows) && !scalarText(this.rows) && variant)
            this.style.gridTemplateRows = variantRows[variant]
        this.style.gridTemplateAreas = scalarText(this.templateAreas)
        this.style.gridAutoColumns =
            scalarText(this.autoColumns) || scalarText(this.autoCols)
        this.style.gridAutoRows = scalarText(this.autoRows)
        this.style.gridAutoFlow = this.autoFlow ?? 'row'
        this.style.gridArea = scalarText(this.area)
        this.style.alignItems = bool(this.empty)
            ? 'center'
            : scalarText(this.align, 'stretch')
        this.style.justifyItems = bool(this.empty)
            ? 'center'
            : scalarText(this.justify, 'stretch')
        this.style.alignContent = scalarText(this.alignContent)
        this.style.justifyContent = scalarText(this.justifyContent)
        const gap = layoutSpacing(this.gap)
        this.style.columnGap = layoutSpacing(this.columnGap) || gap
        this.style.rowGap = layoutSpacing(this.rowGap) || gap
        this.toggleAttribute('data-empty', bool(this.empty))
    }
}
