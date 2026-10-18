import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ComboboxProps extends StudioProps {}

/** Headless behavior for the Combobox component. */
export abstract class ComboboxBase extends StudioComponentBase<ComboboxProps> {
    readonly componentName = 'combobox'
    readonly componentKind: StudioKind = 'search'
}
