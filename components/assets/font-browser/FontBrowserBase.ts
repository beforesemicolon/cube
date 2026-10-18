import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FontBrowserProps extends StudioProps {}

/** Headless behavior for the Font browser component. */
export abstract class FontBrowserBase extends StudioComponentBase<FontBrowserProps> {
    readonly componentName = 'font-browser'
    readonly componentKind: StudioKind = 'collection'
}
