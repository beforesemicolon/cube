import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FontFamilyProps extends StudioProps {}

/** Headless behavior for the Font family component. */
export abstract class FontFamilyBase extends StudioComponentBase<FontFamilyProps> {
    readonly componentName = 'font-family'
    readonly componentKind: StudioKind = 'select'
}
