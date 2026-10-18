import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FilePickerProps extends StudioProps {}

/** Headless behavior for the File picker component. */
export abstract class FilePickerBase extends StudioComponentBase<FilePickerProps> {
    readonly componentName = 'file-picker'
    readonly componentKind: StudioKind = 'file'
}
