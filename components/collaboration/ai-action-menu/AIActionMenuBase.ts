import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AIActionMenuProps extends StudioProps {}

/** Headless behavior for the AI action menu component. */
export abstract class AIActionMenuBase extends StudioComponentBase<AIActionMenuProps> {
    readonly componentName = 'ai-action-menu'
    readonly componentKind: StudioKind = 'collection'
}
