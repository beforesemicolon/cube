import { BoxBase, type BoxProps } from '../../layout/box/BoxBase.js'

export interface CardProps extends BoxProps {}

/** A box surface without content or layout assumptions. */
export abstract class CardBase extends BoxBase<CardProps> {}
