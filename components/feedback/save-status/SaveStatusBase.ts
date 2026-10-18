import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SaveStatusProps extends StudioProps {}

/** Headless behavior for the Save status component. */
export abstract class SaveStatusBase extends StudioComponentBase<SaveStatusProps> {
    readonly componentName = 'save-status'
    readonly componentKind: StudioKind = 'status'
}
