import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ProjectPickerProps extends StudioProps {}

/** Headless behavior for the Project picker component. */
export abstract class ProjectPickerBase extends StudioComponentBase<ProjectPickerProps> {
    readonly componentName = 'project-picker'
    readonly componentKind: StudioKind = 'select'
}
