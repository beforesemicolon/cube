import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface DiffPreviewProps extends StudioProps {}

/** Headless behavior for the Diff preview component. */
export abstract class DiffPreviewBase extends StudioComponentBase<DiffPreviewProps> {
    readonly componentName = 'diff-preview'
    readonly componentKind: StudioKind = 'display'
}
