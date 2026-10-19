import { InputBase, type InputProps } from '../InputBase.js'
import type { StudioKind } from '../../studio/types.js'

export interface FilePickerProps extends InputProps {
    fileLabel?: string
    fileRequirements?: string
    required?: boolean
    multiple?: boolean
}

/** Headless behavior for the File picker component. */
export abstract class FilePickerBase extends InputBase<FilePickerProps> {
    static observedAttributes = [...InputBase.observedAttributes, 'file-label', 'file-requirements', 'required', 'multiple']
    fileLabel = ''
    fileRequirements = ''
    required = false
    multiple = false
    readonly componentName = 'file-picker'
    readonly componentKind: StudioKind = 'file'
}
