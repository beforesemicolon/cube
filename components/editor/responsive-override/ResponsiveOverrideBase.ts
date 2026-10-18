import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ResponsiveOverrideProps extends StudioProps {}

/** Headless behavior for the Responsive override component. */
export abstract class ResponsiveOverrideBase extends StudioComponentBase<ResponsiveOverrideProps> {
    readonly componentName = 'responsive-override'
    readonly componentKind: StudioKind = 'editor'
}
