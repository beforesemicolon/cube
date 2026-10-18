import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface EditableLabelProps extends StudioProps {}

/** Headless behavior for the Editable label component. */
export abstract class EditableLabelBase extends StudioComponentBase<EditableLabelProps> {
    readonly componentName = 'editable-label'
    readonly componentKind: StudioKind = 'text'
}
