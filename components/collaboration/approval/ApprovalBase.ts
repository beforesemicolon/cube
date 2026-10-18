import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ApprovalProps extends StudioProps {}

/** Headless behavior for the Approval component. */
export abstract class ApprovalBase extends StudioComponentBase<ApprovalProps> {
    readonly componentName = 'approval'
    readonly componentKind: StudioKind = 'editor'
}
