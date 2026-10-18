import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ActionEditorProps extends StudioProps {}

/** Headless behavior for the Action editor component. */
export abstract class ActionEditorBase extends StudioComponentBase<ActionEditorProps> {
    readonly componentName = 'action-editor'
    readonly componentKind: StudioKind = 'editor'
}
