import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface IconBrowserProps extends StudioProps {}

/** Headless behavior for the Icon browser component. */
export abstract class IconBrowserBase extends StudioComponentBase<IconBrowserProps> {
    readonly componentName = 'icon-browser'
    readonly componentKind: StudioKind = 'collection'
}
