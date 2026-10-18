import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface SymbolLibraryProps extends StudioProps {}

/** Headless behavior for the Symbol library component. */
export abstract class SymbolLibraryBase extends StudioComponentBase<SymbolLibraryProps> {
    readonly componentName = 'symbol-library'
    readonly componentKind: StudioKind = 'collection'
}
