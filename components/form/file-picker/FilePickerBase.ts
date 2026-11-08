import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import type { StudioKind } from '../../studio/types.js'
import type { ButtonVariant } from '../../action/button/ButtonBase.js'

export type FilePickerValue = string | readonly string[]
export type FilePickerCapture = '' | 'user' | 'environment'
export type FilePickerPresentation = 'dropzone' | 'button'

export interface FilePickerProps extends FieldControlProps<FilePickerValue> {
    fileLabel?: string
    fileRequirements?: string
    multiple?: boolean
    accept?: string
    capture?: FilePickerCapture
    presentation?: FilePickerPresentation
    variant?: ButtonVariant
    icon?: string
    loading?: boolean
}

/** Headless behavior for the File picker component. */
export abstract class FilePickerBase extends FieldControlBase<FilePickerProps, FilePickerValue> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes,
        'file-label',
        'file-requirements',
        'multiple',
        'accept',
        'capture',
        'presentation',
        'variant',
        'icon',
        'loading',
    ]
    value: FilePickerValue = ''
    fileLabel = ''
    fileRequirements = ''
    multiple = false
    accept = '*/*'
    capture: FilePickerCapture = ''
    presentation: FilePickerPresentation = 'dropzone'
    variant: ButtonVariant = 'secondary'
    icon = ''
    loading = false
    files: readonly File[] = []
    readonly componentName = 'file-picker'
    readonly componentKind: StudioKind = 'file'
    /** Open the native chooser from a user activation without exposing internals. */
    pickFiles(accept = this.accept): boolean {
        const control = this.fieldElement()
        if (this.unavailable || this.readOnly || !control) return false
        control.accept = accept
        control.value = ''
        control.click()
        return true
    }
    protected get unavailable(): boolean {
        return super.unavailable || this.loading
    }
    protected fieldElement(): HTMLInputElement | undefined { return this.refs.control?.[0] instanceof HTMLInputElement ? this.refs.control[0] : undefined }
    protected captureValue(): FilePickerValue { return Array.isArray(this.value) ? [...this.value] : this.value }
    setFiles(files: readonly File[], originalEvent?: Event): boolean {
        const next = this.multiple ? [...files] : files.slice(0, 1)
        const value = this.multiple ? next.map(file => file.name) : next[0]?.name ?? ''
        const previousFiles = this.files
        return this.commitState(this.value,value,originalEvent,{files:next,previousFiles},changed=>{this.files=next;this.value=changed},
            (previous,changed)=>this.valuesEqual(previous,changed)&&previousFiles.length===next.length&&previousFiles.every((file,index)=>file===next[index]))
    }
    protected restoreValue(value: FilePickerValue | FormRestoreValue): void {
        const control = this.fieldElement()
        if (control instanceof HTMLInputElement && control.type === 'file') control.value = ''
        if (value instanceof File) {
            this.files = [value]
            this.value = value.name
            return
        }
        if (value instanceof FormData) {
            this.files = value.getAll(this.name).filter((item): item is File => item instanceof File)
            this.value = this.multiple ? this.files.map(file => file.name) : this.files[0]?.name ?? ''
            return
        }
        this.files = []
        this.value = Array.isArray(value) ? [...value] : value ?? ''
    }
    protected syncFormValue(): void {
        if (!this.files.length) { this.syncForm(null); return }
        if (!this.multiple) { this.syncForm(this.files[0] ?? null); return }
        const data = new FormData()
        if (this.name) for (const file of this.files) data.append(this.name, file)
        this.syncForm(data)
    }
}
