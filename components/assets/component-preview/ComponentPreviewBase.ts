import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ComponentPreviewProps extends StudioProps {}

/** Headless behavior for the Component preview component. */
export abstract class ComponentPreviewBase extends StudioComponentBase<ComponentPreviewProps> {
    readonly componentName = 'component-preview'
    readonly componentKind: StudioKind = 'display'
}
