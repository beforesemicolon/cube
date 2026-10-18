import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PreferencesProps extends StudioProps {}

/** Headless behavior for the Preferences component. */
export abstract class PreferencesBase extends StudioComponentBase<PreferencesProps> {
    readonly componentName = 'preferences'
    readonly componentKind: StudioKind = 'panel'
}
