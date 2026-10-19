import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import type { StudioKind } from '../../studio/types.js'

export type FilePickerValue = string | readonly string[]

export interface FilePickerProps extends FieldControlProps<FilePickerValue> {
    fileLabel?: string
    fileRequirements?: string
    multiple?: boolean
}

/** Headless behavior for the File picker component. */
export abstract class FilePickerBase extends FieldControlBase<FilePickerProps, FilePickerValue> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'file-label', 'file-requirements', 'multiple']
    value: FilePickerValue = ''
    fileLabel = ''
    fileRequirements = ''
    multiple = false
    files: readonly File[] = []
    readonly componentName = 'file-picker'
    readonly componentKind: StudioKind = 'file'
    protected fieldElement(): HTMLInputElement | undefined { return this.contentRoot.querySelector<HTMLInputElement>('input[type="file"][part~="control"]') ?? undefined }
    protected captureValue(): FilePickerValue { return Array.isArray(this.value) ? [...this.value] : this.value }
    setFiles(files: readonly File[], originalEvent?: Event): boolean {
        const next = this.multiple ? [...files] : files.slice(0, 1)
        const value = this.multiple ? next.map(file => file.name) : next[0]?.name ?? ''
        return this.commitValue(value,originalEvent,{files:next},changed=>{this.files=next;this.value=changed})
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
