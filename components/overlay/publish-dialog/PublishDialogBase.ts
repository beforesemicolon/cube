import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface PublishDialogProps extends StudioProps {}

/** Headless behavior for the Publish dialog component. */
export abstract class PublishDialogBase extends StudioComponentBase<PublishDialogProps> {
    readonly componentName = 'publish-dialog'
    readonly componentKind: StudioKind = 'panel'
}
