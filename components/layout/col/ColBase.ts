import { RowBase, type RowProps } from '../row/RowBase.js'

export interface ColProps extends Omit<RowProps, 'collapseAt'> {}

/** Vertical layout behavior with the same sizing and alignment contract as Row. */
export abstract class ColBase<P extends ColProps = ColProps> extends RowBase<P> {}
