import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AccordionProps extends StudioProps {}

/** Headless behavior for the Accordion component. */
export abstract class AccordionBase extends StudioComponentBase<AccordionProps> {
    readonly componentName = 'accordion'
    readonly componentKind: StudioKind = 'panel'
}
