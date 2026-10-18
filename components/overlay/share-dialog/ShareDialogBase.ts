import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface ShareDialogProps extends StudioProps {}

/** Headless behavior for the Share dialog component. */
export abstract class ShareDialogBase extends StudioComponentBase<ShareDialogProps> {
    readonly componentName = 'share-dialog'
    readonly componentKind: StudioKind = 'panel'
}
