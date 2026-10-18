import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface FilePickerProps extends StudioProps {
    fileLabel?: string
    fileRequirements?: string
}

/** Headless behavior for the File picker component. */
export abstract class FilePickerBase extends StudioComponentBase<FilePickerProps> {
    static observedAttributes = [...StudioComponentBase.observedAttributes, 'file-label', 'file-requirements']
    fileLabel = ''
    fileRequirements = ''
    readonly componentName = 'file-picker'
    readonly componentKind: StudioKind = 'file'
}
