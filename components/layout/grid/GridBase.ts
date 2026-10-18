import { BoxBase, type BoxProps } from '../box/BoxBase.js'
import { scalarText } from '../../core/value.js'

export interface GridProps extends BoxProps {
    columns?: string
    rows?: string
    autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
    align?: string
    justify?: string
}

/** Grid track behavior without imposing child markup. */
export abstract class GridBase<P extends GridProps = GridProps> extends BoxBase<P> {
    static observedAttributes = [...BoxBase.observedAttributes, 'columns', 'rows', 'auto-flow', 'align', 'justify']
    columns = 'minmax(0, 1fr)'
    rows = ''
    autoFlow: GridProps['autoFlow'] = 'row'
    align = 'stretch'
    justify = 'stretch'

    protected syncLayout(): void {
        super.syncLayout()
        this.style.gridTemplateColumns = scalarText(this.columns, 'minmax(0, 1fr)')
        this.style.gridTemplateRows = scalarText(this.rows)
        this.style.gridAutoFlow = this.autoFlow ?? 'row'
        this.style.alignItems = scalarText(this.align, 'stretch')
        this.style.justifyItems = scalarText(this.justify, 'stretch')
    }
}
