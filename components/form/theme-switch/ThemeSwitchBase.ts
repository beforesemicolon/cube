import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ThemeSwitchProps extends StudioProps {}

/** Headless behavior for the Theme switch component. */
export abstract class ThemeSwitchBase extends StudioComponentBase<ThemeSwitchProps> {
    readonly componentName = 'theme-switch'
    readonly componentKind: StudioKind = 'choice'
}
