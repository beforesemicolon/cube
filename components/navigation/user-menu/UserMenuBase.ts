import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface UserMenuProps extends StudioProps {}

/** Headless behavior for the User menu component. */
export abstract class UserMenuBase extends StudioComponentBase<UserMenuProps> {
    readonly componentName = 'user-menu'
    readonly componentKind: StudioKind = 'collection'
}
