import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AutocompleteProps extends StudioProps {}

/** Headless behavior for the Autocomplete component. */
export abstract class AutocompleteBase extends StudioComponentBase<AutocompleteProps> {
    readonly componentName = 'autocomplete'
    readonly componentKind: StudioKind = 'search'
}
