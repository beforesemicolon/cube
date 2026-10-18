import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ComponentBrowserProps extends StudioProps {}

/** Headless behavior for the Component browser component. */
export abstract class ComponentBrowserBase extends StudioComponentBase<ComponentBrowserProps> {
    readonly componentName = 'component-browser'
    readonly componentKind: StudioKind = 'collection'
}
