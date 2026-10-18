import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface BottomSheetProps extends StudioProps {}

/** Headless behavior for the Bottom sheet component. */
export abstract class BottomSheetBase extends StudioComponentBase<BottomSheetProps> {
    readonly componentName = 'bottom-sheet'
    readonly componentKind: StudioKind = 'panel'
}
