import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SearchProps extends StudioProps {}

/** Headless behavior for the Search component. */
export abstract class SearchBase extends StudioComponentBase<SearchProps> {
    readonly componentName = 'search'
    readonly componentKind: StudioKind = 'search'
}
