import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface RadioProps extends StudioProps {}

/** Headless behavior for the Radio component. */
export abstract class RadioBase extends StudioComponentBase<RadioProps> {
    readonly componentName = 'radio'
    readonly componentKind: StudioKind = 'choice'
}
