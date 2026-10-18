import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PopoverProps extends StudioProps {}

/** Headless behavior for the Popover component. */
export abstract class PopoverBase extends StudioComponentBase<PopoverProps> {
    readonly componentName = 'popover'
    readonly componentKind: StudioKind = 'panel'
}
