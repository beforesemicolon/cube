import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface AICommandProps extends StudioProps {}

/** Headless behavior for the AI command component. */
export abstract class AICommandBase extends StudioComponentBase<AICommandProps> {
    readonly componentName = 'ai-command'
    readonly componentKind: StudioKind = 'text'
}
