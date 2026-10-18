import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface UndoRedoProps extends StudioProps {}

/** Headless behavior for the Undo redo component. */
export abstract class UndoRedoBase extends StudioComponentBase<UndoRedoProps> {
    readonly componentName = 'undo-redo'
    readonly componentKind: StudioKind = 'editor'
}
