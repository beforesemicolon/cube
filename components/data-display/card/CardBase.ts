import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CardProps extends StudioProps {}

/** Headless behavior for the Card component. */
export abstract class CardBase extends StudioComponentBase<CardProps> {
    readonly componentName = 'card'
    readonly componentKind: StudioKind = 'panel'
}
