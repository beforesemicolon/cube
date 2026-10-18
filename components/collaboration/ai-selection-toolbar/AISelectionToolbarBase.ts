import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AISelectionToolbarProps extends StudioProps {}

/** Headless behavior for the AI selection toolbar component. */
export abstract class AISelectionToolbarBase extends StudioComponentBase<AISelectionToolbarProps> {
    readonly componentName = 'ai-selection-toolbar'
    readonly componentKind: StudioKind = 'panel'
}
