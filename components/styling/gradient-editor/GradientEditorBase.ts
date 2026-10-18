import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface GradientEditorProps extends StudioProps {}

/** Headless behavior for the Gradient editor component. */
export abstract class GradientEditorBase extends StudioComponentBase<GradientEditorProps> {
    readonly componentName = 'gradient-editor'
    readonly componentKind: StudioKind = 'editor'
}
