import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface WorkspaceSwitcherProps extends StudioProps {}

/** Headless behavior for the Workspace switcher component. */
export abstract class WorkspaceSwitcherBase extends StudioComponentBase<WorkspaceSwitcherProps> {
    readonly componentName = 'workspace-switcher'
    readonly componentKind: StudioKind = 'select'
}
