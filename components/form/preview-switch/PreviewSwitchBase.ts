import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PreviewSwitchProps extends StudioProps {}

/** Headless behavior for the Preview switch component. */
export abstract class PreviewSwitchBase extends StudioComponentBase<PreviewSwitchProps> {
    readonly componentName = 'preview-switch'
    readonly componentKind: StudioKind = 'choice'
}
